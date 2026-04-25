import { HttpException, Injectable, Logger } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuperAdminPrismaService } from 'src/prisma/superAdminprisma.service';
import axios from 'axios';

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

@Injectable()
export class OauthService {
  private readonly logger = new Logger(OauthService.name);
  private readonly googleUserInfoURL =
    'https://www.googleapis.com/oauth2/v2/userinfo';

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: SuperAdminPrismaService,
  ) {}

  async validateGoogleToken(
    accessToken: string,
    idToken?: string,
    email?: string,
    name?: string,
    image?: string,
  ) {
    try {
      await this.prisma
        .$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
      await this.prisma
        .$executeRaw`SELECT set_config('app.tenant_id', '0', TRUE)`;
      await this.prisma
        .$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

      const userInfo = await this.getGoogleUserInfo(accessToken);
      const userEmail = email || userInfo.data.email;

      let user = await this.findExistingUser(userEmail);

      if (!user) {
        const emailDomain = userInfo.data.email.split('@')[1];

        const isTenantExists = await this.prisma.company.findUnique({
          where: {
            domain: emailDomain,
          },
        });

        if (!isTenantExists) {
          const tenant = await this.prisma.company.create({
            data: {
              name: emailDomain,
              website: emailDomain,
              domain: emailDomain,
              logo:"https://peakstorage.blr1.digitaloceanspaces.com/project-docs/cmb3q368t00j8rdgcrga8hfhq/b5a838af-9e8c-40dd-9d7f-f35453dc2dde.png",
              userLimit: 100, 
            },
          });

          user = await this.prisma.user.create({
            data: {
              email: userEmail,
              name: name || userInfo.data.name,
              avatar: image || userInfo.data.picture,
              designation: '',
              role: 'admin',
              tenantId: tenant.id,
              status: 'active',
            },
          });
        } else {
          const companyLimit = await this.prisma.company.findFirst({
            where: { id: isTenantExists.id },
            select: {
              userLimit: true,
              _count: {
                select: {
                  users: true,
                },
              },
            },
          });
          if (!companyLimit) {
            throw new HttpException('Company not found', 404);
          }
          const effectiveUserLimit = Math.max(companyLimit.userLimit ?? 0, 100);
          if (companyLimit._count.users >= effectiveUserLimit) {
            throw new HttpException('User limit reached for this company', 403);
          }
          user = await this.prisma.user.create({
            data: {
              email: userEmail,
              name: name || userInfo.data.name,
              avatar: image || userInfo.data.picture,
              designation: '',
              role: 'employee',
              tenantId: isTenantExists.id,
              status: 'active',
            },
          });
        }
      }

      if (user.status === 'banned') {
        return {
          success: false,
          error: 'User is banned',
        };
      }
      if (user.status === 'deleted') {
        return {
          success: false,
          error: 'User is deleted',
        };
      }

      const token = this.generateJwtToken(user);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(`Google auth failed: ${error.message}`);
      return {
        success: false,
        error: error.message || 'Google authentication failed',
      };
    }
  }

  private async getGoogleUserInfo(accessToken: string) {
    try {
      return await axios.get<GoogleUserInfo>(this.googleUserInfoURL, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 5000,
      });
    } catch (error) {
      throw new Error('Invalid Google access token');
    }
  }

  private generateJwtToken(user: any) {
    return this.jwtService.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '15d',
      },
    );
  }

  private async findExistingUser(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch user: ${error.message}`);

      if (
        error.message.includes(
          'unrecognized configuration parameter "app.tenant_id"',
        )
      ) {
        this.logger.warn(
          'RLS misconfiguration detected. Ensure app.tenant_id is set correctly.',
        );
      }

      return null;
    }
  }

  private async getMicrosoftUserInfo(accessToken: string) {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data;
  }

  async validateMicrosoftToken(
    accessToken: string,
    idToken?: string,
    email?: string,
    name?: string,
    image?: string,
  ) {
    try {
      const userInfo = await this.getMicrosoftUserInfo(accessToken);

      const userEmail = userInfo.mail || email;

      await this.prisma
        .$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
      await this.prisma
        .$executeRaw`SELECT set_config('app.tenant_id', '0', TRUE)`;
      await this.prisma
        .$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

      let user = await this.findExistingUser(userEmail);

      if (!user) {
        const emailDomain = userEmail.split('@')[1];

        const isTenantExists = await this.prisma.company.findUnique({
          where: { domain: emailDomain },
        });

        if (!isTenantExists) {
          const tenant = await this.prisma.company.create({
            data: {
              name: emailDomain,
              website: emailDomain,
              domain: emailDomain,
              userLimit:100
            },
          });

          user = await this.prisma.user.create({
            data: {
              email: userEmail,
              name: userInfo.displayName || userInfo.givenName || '',
              avatar: '', // Microsoft doesn't provide avatar in Graph v1.0/me
              designation: '',
              role: 'admin',
              tenantId: tenant.id,
              status: 'active',
            },
          });
        } else {
          user = await this.prisma.user.create({
            data: {
              email: userEmail,
              name: userInfo.displayName || userInfo.givenName || '',
              avatar: '',
              designation: '',
              role: 'employee',
              tenantId: isTenantExists.id,
              status: 'active',
            },
          });
        }
      }

      if (user.status === 'banned') {
        return { success: false, error: 'User is banned' };
      }
      if (user.status === 'deleted') {
        return { success: false, error: 'User is deleted' };
      }

      const token = this.generateJwtToken(user);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(`Microsoft auth failed: ${error.message}`);
      return {
        success: false,
        error: error.message || 'Microsoft authentication failed',
      };
    }
  }
}
