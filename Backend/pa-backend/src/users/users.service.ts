import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as moment from 'moment';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, status } from '@prisma/client';

import { AdminService } from 'src/admin/admin.service';
import { BulkInviteDto } from './dto/bulkInviteDto.dto';
import { CheckDomainDto } from './dto/check-domain.dto';
import { CompanyDTO } from './dto/update-company.dto';
import { CreateSuperAdminDto } from './dto/superAdminDto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { GoogleAuthService } from './google-oauth.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginWithGoogleDto } from './dto/login-with-google.dto';
import { OtpService } from 'src/auth/otp/otp.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuperAdminPrismaService } from 'src/prisma/superAdminprisma.service';
import { UpdateSelfDto } from './dto/update-self.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserVisibilityDto } from './dto/UpdateUserVisibility';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  private readonly s3Client = new S3Client({
    region: process.env.S3_REGION || 'blr1',
    endpoint: process.env.S3_ENDPOINT || 'https://blr1.digitaloceanspaces.com',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
  });

  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly googleService: GoogleAuthService,
    private readonly otpService: OtpService,
    private adminPrisma: SuperAdminPrismaService,
  ) {}
  async uploadFileToS3(file: Express.Multer.File, tenantId: string): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const bucketName = process.env.S3_BUCKET_NAME || 'peakstorage';

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `company-logos/${tenantId}/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);
      return `https://${bucketName}.blr1.digitaloceanspaces.com/company-logos/${tenantId}/${fileName}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  async create(createUserDto: CreateUserDto) {
  try {
    // Step 1: Enable RLS bypass temporarily
    await this.prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
    await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', '0', TRUE)`;

    const emailDomain = createUserDto.email.split('@')[1];

    // Step 2: Check if company with the same domain already exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { domain: emailDomain },
    });

    if (existingCompany) {
      throw new HttpException(
        'Company already exists. Contact your admin.',
        400,
      );
    }

    // Optional: Check for existing website (if needed)
    const existWeb = await this.prisma.company.findFirst({
      where: { website: createUserDto.website},
    });

    if (existWeb) {
      throw new HttpException(
        'Company with this website already exists.',
        400,
      );
    }

    // Step 3: Hash the password before transaction
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Step 4: Run transaction to create company, user and admin access
    const result = await this.prisma.$transaction(
      async (prisma) => {
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;

        const company = await prisma.company.create({
          data: {
            name: createUserDto.companyname,
            website: createUserDto.website,
            industry: createUserDto.industry,
            employeeSize: createUserDto.employeeSize,
            domain: emailDomain,
            userLimit: createUserDto?.userLimit ?? 100,
            logo:"https://peakstorage.blr1.digitaloceanspaces.com/project-docs/cmb3q368t00j8rdgcrga8hfhq/b5a838af-9e8c-40dd-9d7f-f35453dc2dde.png"      
          },
        });

        const user = await prisma.user.create({
          data: {
            tenantId: company.id,
            name: createUserDto.name,
            email: createUserDto.email,
            phoneCode: createUserDto.phoneCode,
            mobile: createUserDto.mobile,
            status: 'not_verified',
            password: hashedPassword,
            designation: createUserDto.designation,
            role: 'admin',
            data: {},
          },
          select: {
            id: true,
            name: true,
            email: true,
            phoneCode: true,
            mobile: true,
            designation: true,
            status: true,
            role: true,
          },
        });

        const adminAccess = await prisma.adminAccess.create({
          data: {
            tenantId: company.id,
            userId: user.id,
            role: 'creator',
          },
        });

        return { user, company, adminAccess };
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );

    // Step 5: Send OTP after successful transaction (optional)
    try {
      // await this.otpService.sendOtp({
      //   email: result.user.email,
      //   reason: 'verify_user',
      // });

      return {
        statusCode: 201,
        message: 'OTP sent for verification',
        data: result,
      };
    } catch (otpError) {
      console.error('Error sending OTP:', otpError);

      return {
        statusCode: 201,
        message:
          'User created successfully but there was an issue sending the verification OTP. Please request a new OTP.',
        data: result,
      };
    }
    }catch (error) {
    console.error('Error creating user:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        
        if (target.includes('domain')) {
          throw new HttpException('A company with this domain already exists.', 400);
        }

        if (target.includes('website')) {
          throw new HttpException('A company with this website already exists.', 400);
        }

        if (target.includes('email')) {
          throw new HttpException('This email is already in use.', 400);
        }

        // Generic fallback
        throw new HttpException('Company with Same Email domain or website already exists', 400);
      }
    }
    throw new HttpException(
      error.message || 'Error creating user',
      error.status || 400,
    );
  }
}

  async login(email: string, password: string) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.tenant_id', '0', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          throw new HttpException('User not found', 404);
        }
        if (user.status === 'not_verified') {
          try {
            await this.otpService.sendOtp({
              email: email,
              reason: 'verify_user',
            });
          } catch (error) {
            throw new HttpException(
              {
                statusCode: error.status || 400,
                message: error.message || 'error while sending otp',
                data: null,
              },
              error.status || 400,
            );
          }
          throw new HttpException('User not verified.', 403);
        }
        if (user.status === status.banned) {
          throw new HttpException('User is banned.', 403);
        }
        if (user.status === status.deleted) {
          throw new HttpException('User is deleted.', 403);
        }

        // Step 3: Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        

        if (!isPasswordValid) {
          throw new HttpException('Invalid credentials', 401);
        }

        // Step 4: Generate JWT token
        const payload = {
          userId: user.id,
          tenantId: user.tenantId,
          role: user.role,
        };

        const token = this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        });

        return {
          statusCode: HttpStatus.OK,
          message: 'Login successful',
          data: { access_token: token },
        };
      });
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error logging in',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  async adminLogin(email: string, password: string) {
    try {
      return await this.adminPrisma.$transaction(async (prisma) => {
        // await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        // await prisma.$executeRaw`SELECT set_config('app.tenant_id', '0', TRUE)`;
        // await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          throw new HttpException('User not found', 404);
        }

        if (user.role !== 'superadmin') {
          throw new HttpException('Unauthorized access', 403);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new HttpException('Invalid credentials', 401);
        }

        // ✅ Validate secret exists
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET is not set');
        }

        const payload = {
          userId: user.id,
          // tenantId: user.tenantId ?? 0, // fallback if tenantId is null
          role: user.role,
        };

        const token = this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '7d', // You can adjust expiration
        });

        return {
          statusCode: HttpStatus.OK,
          message: 'Login successful',
          data: { access_token: token },
        };
      });
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error logging in',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  private formatResponse(
    statusCode: number,
    message: string,
    data: any = null,
  ) {
    return {
      statusCode,
      message,
      data,
    };
  }

  async inviteUser(inviteUserDto: InviteUserDto, req: any) {
    const tenantId = req.user.tenantId; // Retrieve tenantId from request (set in AuthGuard)s
    const userId = req.user.userId;

    try {
      // Begin a transaction
      const result = await this.prisma.$transaction(
        async (prisma) => {
          
          prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
          await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
          prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;
          const companyLimit = await prisma.company.findFirst({
            where: { id: tenantId },
            select: {
              userLimit: true,
              _count: {
               select:{
                users: true,
               }
              }
            },
          });
          if (!companyLimit) {
            throw new HttpException('Company not found', 404);
          }
          const effectiveUserLimit = Math.max(companyLimit.userLimit ?? 0, 100);
          if (companyLimit._count.users >= effectiveUserLimit) {
            throw new HttpException(
              'User limit reached for this company',
              403,
            );
          }
          let role = 'employee';
          const inviter = await prisma.user.findFirst({
            where: { id: userId },
          });

          if (inviteUserDto.orgUnit) {
            const dept = await prisma.team.findFirst({
              where: { id: inviteUserDto.orgUnit },
            });
            if (!dept) {
              throw new HttpException('Enter valid department', 404);
            }
            if (inviteUserDto.isDeptHead) {
              role = 'dept_head';
              const dept = await prisma.team.findFirst({
                where: { id: inviteUserDto.orgUnit },
              });
              if (dept.leadId) {
                throw new HttpException(
                  'Head for the department already exists',
                  409,
                );
              }
            }
          }
          if (inviteUserDto.teamId) {
            const team = await prisma.team.findFirst({
              where: { id: inviteUserDto.teamId },
            });
            if (!team) {
              throw new HttpException('Enter valid team', 404);
            }
            if (inviteUserDto.isTeamLead) {
              role = 'team_lead';
              if (team.leadId) {
                throw new HttpException(
                  'Head for the team already exists',
                  409,
                );
              }
            }
          }

          if (inviteUserDto.isAdmin) {
            role = 'admin';
          }

          if (!tenantId) {
            // If tenantId is not found in the request, return an error response with status code 400
            throw new HttpException('TenantId is missing or invalid', 400);
          }
          const tenant = await prisma.company.findFirst({
            where: { id: tenantId },
          });
          if (!tenant) {
            throw new HttpException('Invalid token', 400);
          }
          // Check if user already exists with the given email
          const existingUser = await prisma.user.findUnique({
            where: { email: inviteUserDto.email },
          });

          if (existingUser) {
            throw new HttpException('User with this email already exist', 409); // Conflict response
          }

          // Create a new user with the status set to 'pending' and assigned to the correct tenantId
          const user = await prisma.user.create({
            data: {
              tenantId, // Attach the tenantId to the user
              name: inviteUserDto.name,
              email: inviteUserDto.email,
              phoneCode: inviteUserDto.phoneCode,
              mobile: inviteUserDto.mobile,
              departmentId: inviteUserDto.orgUnit,
              designation: inviteUserDto.designation,
              role: role,
              status: 'pending', // Default status set to 'pending'
              teamId: inviteUserDto.teamId,
              managerId: inviteUserDto.managerId,
            },
          });
          if (role === 'team_lead') {
            const team = await prisma.team.findFirst({
              where: { id: inviteUserDto.teamId },
            });
            team.leadId = user.id;
          }
          if (role === 'dept_head') {
            const dept = await prisma.team.findFirst({
              where: { id: inviteUserDto.orgUnit },
            });
            dept.leadId = user.id;
          }
          // Generate a token with INVITE_SECRET from .env

          const payload = {
            userId: user.id,
            tenantId: user.tenantId,
          };

          // Sign the token with the INVITE_SECRET
          const token = this.jwtService.sign(payload, {
            secret: process.env.INVITE_SECRET,
            expiresIn: 1296000,
          });

          // Return the token
          return { token, user, inviter, tenant };
        },
        { timeout: 20000 },
      );
      const BASEURL = process.env.NEXT_URL;
      const link = `${BASEURL}/auth/invite?token=${result.token}`;
      await this.sendMail(result.user, result.inviter, result.tenant, link);
      // If transaction succeeds, return success response
      return this.formatResponse(200, 'User invited successfully', null);
    } catch (error) {
      console.error(error); // Log the error for debugging
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'error inviting user',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  // async verifyGoogleAccessToken(token: string){
  //   const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  //   try {
  //     // Verify the token with Google's OAuth2 client
  //     const ticket = await client.verifyIdToken({
  //       idToken: token,
  //       audience: process.env.GOOGLE_CLIENT_ID, // Replace with your Google Client ID
  //     });
  //
  //     // Get the payload from the verified token
  //     const payload = ticket.getPayload();
  //
  //     if (!payload) {
  //       throw new Error('Invalid token payload');
  //     }

  //     // Return the email from the payload
  //     const email= payload.email ;
  //     return email;
  //   } catch (error) {
  //     console.error('Error verifying Google access token:', error);
  //     return null;
  //   }
  // }
  // async loginWithGoogle(dto: LoginWithGoogleDto) {
  //   try {
  //

  //     // Wrap the logic in a transaction
  //     const result = await this.prisma.$transaction(async (prisma) => {
  //       // Set RLS configurations for the transaction
  //       await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
  //       await prisma.$executeRaw`SELECT set_config('app.tenant_id', '0', TRUE)`;
  //       await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;

  //       // Verify the Google access token and extract the email
  //       const email = await this.googleService.validateGoogleAccessToken(
  //         dto.token,
  //       );

  //       if (!email) {
  //
  //         throw new Error('Invalid Google access token');
  //       }

  //       // Fetch the user details from the database
  //       const user = await prisma.user.findFirst({
  //         where: { email },
  //       });
  //
  //       if (user.status === 'pending' || user.status === 'not_verified') {
  //
  //         await prisma.user.update({
  //           where: { id: user.id },
  //           data: { status: 'active' },
  //         });
  //
  //       }
  //       if (!user) {
  //
  //         throw new Error('User not found');
  //       }

  //       // Generate the JWT token
  //       const payload = {
  //         userId: user.id,
  //         tenantId: user.tenantId,
  //         role: user.role,
  //       };
  //
  //       const token = this.jwtService.sign(payload, {
  //         secret: process.env.JWT_SECRET,
  //       });
  //

  //       // Return the token
  //       return {
  //         access_token: token,
  //       };
  //     });

  //     // Return success response if transaction succeeds
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: 'Login successful',
  //       data: result,
  //     };
  //   } catch (error) {
  //     console.error('Error during Google login:', error.message);

  //     if (error.message === 'Invalid Google access token') {
  //       return {
  //         statusCode: HttpStatus.UNAUTHORIZED,
  //         message: error.message,
  //         data: null,
  //       };
  //     }

  //     if (error.message === 'User not found') {
  //       return {
  //         statusCode: HttpStatus.NOT_FOUND,
  //         message: error.message,
  //         data: null,
  //       };
  //     }

  //     return {
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: 'An unexpected error occurred',
  //       data: null,
  //     };
  //   }
  // }

  async updateCompany(req: any, updateData: CompanyDTO) {
    const tenantId = req.user.tenantId;
    try {
      return await this.prisma.$transaction(async (transaction) => {
        await transaction.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await transaction.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await transaction.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;
        try {
          if (updateData.domain) {
            const existingCompany = await transaction.company.findUnique({
              where: { domain: updateData.domain },
            });

            if (existingCompany) {
              throw new HttpException('Domain already in use', 409);
            }
          }
          if (updateData.website) {
            const existWeb = await transaction.company.findFirst({
              where: { website: updateData.website },
            });
            if (existWeb) {
              throw new HttpException('Website already in use', 409);
            }
          }
          // Fetch the existing company (optional, useful for validation or logging)
          const existingCompany = await transaction.company.findUnique({
            where: { id: tenantId },
          });
          if (!existingCompany) {
            throw new HttpException('Company not found', 404);
          }

          // Update the company in the transaction
          const updatedCompany = await transaction.company.update({
            where: { id: tenantId },
            data: updateData,
          });

          return updatedCompany;
        } catch (error) {
          throw new HttpException(
            error.message || 'Error updating Company',
            error.status || 400,
          );
        }
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating team',
        error.status || 400,
      );
    }
  }

  async getAllUsersByTenantId(req: any, dto: GetAllUserDto) {
    const tenantId = req.user.tenantId;
    const { search, pageNo, pageSize = 10 } = dto;

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
          await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
          await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

          const user = await tx.user.findFirst({
            where: { id: req.user.userId },
          });
          if (user.role === 'employee') {
            throw new HttpException('Unauthorized access', 403);
          }

          const whereCondition: any = { tenantId };
          if (search) {
            whereCondition.OR = [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ];
          }

          let users;
          let totalCount = await tx.user.count({ where: whereCondition });

          if (pageNo) {
            const skip = (pageNo - 1) * pageSize;
            const take = pageSize;

            users = await tx.user.findMany({
              where: whereCondition,
              select: {
                id: true,
                avatar: true,
                tenantId: true,
                name: true,
                email: true,
                phoneCode: true,
                mobile: true,
                teamId: true,
                departmentId: true,
                managerId: true,
                joiningDate: true,
                designation: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                data: true,
                role: true,
                team: true,
                department: true,
                checkInVisibility:true,
                oneOnOneVisibility:true,
                performanceVisibility:true,
              },
              skip,
              take,
            });

            const usersWithManagers = await this.fetchManagers(tx, users);

            const totalPages = Math.ceil(totalCount / pageSize);
            const remainingPages = totalPages - pageNo;

            return {
              data: usersWithManagers,
              pagination: {
                currentPage: pageNo,
                totalPages,
                totalItems: totalCount,
                remainingPages,
              },
            };
          } else {
            users = await tx.user.findMany({
              where: whereCondition,
              select: {
                id: true,
                avatar: true,
                tenantId: true,
                name: true,
                email: true,
                phoneCode: true,
                mobile: true,
                teamId: true,
                departmentId: true,
                managerId: true,
                joiningDate: true,
                designation: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                data: true,
                role: true,
                team: true,
                department: true,
              },
            });

            return { data: await this.fetchManagers(tx, users) };
          }
        },
        { timeout: 20000 },
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching users',
        error.status || 400,
      );
    }
  }

  private async fetchManagers(tx: any, users: any[]) {
    const managerIds = users.map((user) => user.managerId).filter((id) => id);
    if (managerIds.length === 0) return users;

    const managers = await tx.user.findMany({
      where: { id: { in: managerIds } },
      select: { id: true, name: true },
    });

    const managerMap = new Map(
      managers.map((manager) => [manager.id, manager]),
    );

    return users.map((user) => ({
      ...user,
      manager: user.managerId ? managerMap.get(user.managerId) || null : null,
    }));
  }

  async getCompany(req: any) {
    const tenantId = req.user.tenantId;
    try {
      return await this.prisma.$transaction(async (transaction) => {
        await transaction.$executeRaw`SELECT set_config('app.bypass_rls', 'on ', TRUE)`;
        await transaction.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await transaction.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;
        try {
          // Fetch the existing company (optional, useful for validation or logging)
          const existingCompany = await transaction.company.findUnique({
            where: { id: tenantId },
          });
          if (!existingCompany) {
            throw new HttpException('Company not found', 404);
          }

          return existingCompany;
        } catch (error) {
          throw new HttpException(
            error.message || 'Error updating Company',
            error.status || 400,
          );
        }
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating team',
        error.status || 400,
      );
    }
  }

  async checkDomain(dto: CheckDomainDto) {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        await transaction.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await transaction.$executeRaw`SELECT set_config('app.tenant_id', '0', TRUE)`;
        await transaction.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        try {
          const company = await transaction.company.findFirst({
            where: { domain: dto.domain },
          });
          if (company) {
            return 'Domain already exists';
          }
          if (!company) {
            throw new HttpException('Domain does not exist', 404);
          }
        } catch (error) {
          throw new HttpException(
            error.message || 'Error updating Company',
            error.status || 400,
          );
        }
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating team',
        error.status || 400,
      );
    }
  }
  async sendMail(user: any, inviter: any, tenant: any, dynamicLink: string) {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME, // Replace with your email
      to: user.email,
      subject: "You're Invited to Collaborate!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    
                    padding: 20px;
                }
                .email-container {
                    background-color: #ffffff;
                    padding: 20px;
                    
                    border-radius: 8px;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .email-header {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    color: #084545;
                }
                .email-body {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #333333;
                }
                .email-button {
                    display: inline-block;
                    margin: 20px 0;
                    padding: 10px 20px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #084545;
                    text-decoration: none;
                    border-radius: 5px;
                    text-align: center;
                }
                .email-footer {
                    text-align: center;
                    font-size: 12px;
                    color: #777777;
                    margin-top: 20px;
                }
                .logo{
                  font-size: 20px;
                  font-weight: 700;
                  color: #084545;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-nav">
              <div class="logo">SecureXai</div>
                </div>
                <div class="email-header">
                    You're Invited to Collaborate!
                </div>
                <div class="email-body">
                    Hi ${user.name},
                    <br><br>
                    ${inviter.name} invited you to collaborate on <strong>${tenant.name}</strong>! Click the button below to get started:
                    <br><br>
                    <a href="${dynamicLink}" class="email-button" style="text-decoration: none; color: #ffffff;">Accept Invitation</a>
                    <br><br>
                    <strong style="color: #084545;">Note:</strong>The invitation will be valid for 15 days.
                    
                </div>
                <div class="email-footer">
                    If you didn’t request this invitation, please disregard this email.
                </div>
            </div>
        </body>
        </html>
      `,
    });
  }
  async inviteUsersBulk(dto: BulkInviteDto[], req: any) {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;

    const results = [];
    const emailArray = [];

    for (const bulkdto of dto) {
      const { name, email } = bulkdto;
      try {
        const result = await this.prisma.$transaction(
          async (prisma) => {
            // Set tenant context
            await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
            await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
            await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;
            
             const companyLimit = await prisma.company.findFirst({
            where: { id: tenantId },
            select: {
              userLimit: true,
              _count: {
               select:{
                users: true,
               }
              }
            },
          });
          if (!companyLimit) {
            throw new HttpException('Company not found', 404);
          }
          const effectiveUserLimit = Math.max(companyLimit.userLimit ?? 0, 100);
          if (companyLimit._count.users >= effectiveUserLimit) {
            throw new HttpException(
              'User limit reached for this company',
              403,
            );
          }

            let teamId, managerId, departmentId;
            let role = 'employee';

            // Get inviter details
            const inviter = await prisma.user.findFirst({
              where: { id: userId },
            });
            if (!inviter) throw new Error('Invalid inviter');

            // Department handling
            if (bulkdto.deptName) {
              const dept = await prisma.team.findFirst({
                where: { name: bulkdto.deptName, tenantId },
              });
              if (!dept) throw new Error('Enter valid department');
              departmentId = dept.id;

              if (bulkdto.role === 'dept_head') {
                if (dept.leadId)
                  throw new Error('Head for the department already exists');
                role = 'dept_head';
              }

              // Team handling
              if (bulkdto.teamName) {
                const team = await prisma.team.findFirst({
                  where: { name: bulkdto.teamName, tenantId },
                });
                if (!team) throw new Error('Enter valid team');
                teamId = team.id;

                if (bulkdto.role === 'team_lead') {
                  if (team.leadId)
                    throw new Error('Head for the team already exists');
                  role = 'team_lead';
                }

                if (team.departmentId !== dept.id) {
                  throw new Error('Team and department do not match');
                }
              }
            }

            // Manager handling
            if (bulkdto.managerMail) {
              const manager = await prisma.user.findFirst({
                where: {
                  email: bulkdto.managerMail,
                  tenantId: tenantId, // Ensure manager is from same tenant
                },
                select: { id: true }, // Only get the ID we need
              });

              if (!manager) {
                throw new Error(
                  `Manager with email ${bulkdto.managerMail} not found in this organization`,
                );
              }
              managerId = manager.id;

              if (bulkdto.email === bulkdto.managerMail) {
                throw new Error('User cannot be their own manager');
              }
            }

            if (bulkdto.role === 'admin') {
              role = 'admin';
            }

            // Validate tenant
            const tenant = await prisma.company.findFirst({
              where: { id: tenantId },
            });
            if (!tenant) throw new Error('Invalid tenant');

            // Check for existing user
            const existingUser = await prisma.user.findUnique({
              where: { email: bulkdto.email },
            });
            if (existingUser)
              throw new Error('User with this email already exists');

            // Date conversions
            const dob = await this.convertToDateTime(bulkdto.dob);
            const joiningDate = await this.convertToDateTime(
              bulkdto.joiningDate,
            );
            const probationEnd = bulkdto.probationEnd
              ? await this.convertToDateTime(bulkdto.probationEnd)
              : null;

            // Create user
            const user = await prisma.user.create({
              data: {
                tenantId,
                name: bulkdto.name,
                email: bulkdto.email,
                phoneCode: bulkdto.phoneCode,
                mobile: bulkdto.mobile,
                designation: bulkdto.designation,
                teamId,
                managerId,
                status: 'pending',
                departmentId,
                empId: bulkdto.empId,
                role: bulkdto.role || role,
                gender: bulkdto.gender,
                dob,
                joiningDate,
                probationPeriod: bulkdto.probationDuration,
                probationPeriodEnd: probationEnd,
                salary: bulkdto.salary,
                salaryCurrency: bulkdto.salaryCurrency,
                linkedinURL: bulkdto.linkedinURL,
              },
            });

            // Update team/department leads if needed
            if (bulkdto.role === 'team_lead' && bulkdto.teamName) {
              await prisma.team.update({
                where: { id: teamId },
                data: { leadId: user.id },
              });
            }

            if (bulkdto.role === 'dept_head' && bulkdto.deptName) {
              await prisma.team.update({
                where: { id: departmentId },
                data: { leadId: user.id },
              });
            }

            // Generate invite token
            const payload = { userId: user.id, tenantId: user.tenantId };
            const token = this.jwtService.sign(payload, {
              secret: process.env.INVITE_SECRET,
              expiresIn: '15d',
            });
            const link = `${process.env.FRONTEND_URL}/auth/invite?token=${token}`;

            return {
              status: 'success',
              message: 'User invited successfully',
              data: { user, inviter, tenant, link },
            };
          },
          { timeout: 10000 },
        );

        // Add to email queue
        emailArray.push({
          name: bulkdto.name,
          email: bulkdto.email,
          link: result.data.link,
          user: result.data.user,
          tenant: result.data.tenant,
          inviter: result.data.inviter,
        });

        results.push({
          name: bulkdto.name,
          email: bulkdto.email,
          status: 'success',
          message: result.message,
        });
      } catch (error) {
        console.error(`Error inviting user ${email}:`, error.message);
        results.push({
          name,
          email,
          status: 'error',
          message: error.message,
        });
      }
    }

    // Send emails (fire and forget)
    emailArray.forEach(async (entry) => {
      try {
        await this.sendMail(
          entry.user,
          entry.inviter,
          entry.tenant,
          entry.link,
        );
      } catch (error) {}
    });

    return {
      statusCode: 200,
      message: 'Bulk user invite completed',
      data: results,
    };
  }
  async convertToDateTime(dateString: string) {
    if (!dateString || dateString.trim() === '') {
      return null;
    }
    const date = moment(dateString, 'DD-MM-YYYY').toDate();
    return isNaN(date.getTime()) ? null : date;
  }

  async getOrgChartByTenantId(tenantId: string) {
    try {
      // Begin
      // coa transaction for each user

      const result = await this.prisma.$transaction(async (prisma) => {
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;

        const users = await prisma.user.findMany({
          where: {
            tenantId: tenantId,
          },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
            designation: true,
            managerId: true,
            role: true,
          },
        });

        return users;
      });
      const users = result;
      return await this.buildOrgChart(users);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching organization chart',
        error.status || 400,
      );
    }
  }

  // Helper function to build the organization chart
  private buildOrgChart(users: any[]) {
    const userMap = new Map(users.map((user) => [user.id, user]));

    const buildTree = (managerId: string | null) => {
      return users
        .filter((user) => user.managerId === managerId)
        .map((user) => ({
          Id: user.id,
          Name: user.name,
          Email: user.email,
          Avatar: user.avatar,
          Team: user.team,
          Department: user.department,
          Designation: user.designation,
          children: buildTree(user.id),
        }));
    };

    const rootAdmin = users.find(
      (user) => user.role === 'admin' && user.managerId === null,
    );

    if (!rootAdmin) {
      throw new Error('No admin user found');
    }

    return {
      Id: rootAdmin.id,
      Name: rootAdmin.name,
      Email: rootAdmin.email,
      Avatar: rootAdmin.avatar,
      Team: rootAdmin.team,
      Department: rootAdmin.department,
      Designation: rootAdmin.designation,
      children: buildTree(rootAdmin.id),
    };
  }
  async updateProfile(
    req: any,
    updateUserDto: UpdateSelfDto,
    file?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    const tenantId = req.user.tenantId;
    try {
      // Start the transaction
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.tenant_id',${tenantId}, TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Prepare the updated data
        const updatedData: Partial<{ name: string; avatar: string }> = {};

        // If a new name is provided, update the name

        if (updateUserDto.name) {
          updatedData.name = updateUserDto.name;
        }

        // If a new profile photo is provided, save it and update the avatar field
        if (file) {
          const filePath = file.path; // Path where the file was saved by diskStorage

          // Store the relative path for the avatar
          updatedData.avatar = `/uploads/${path.basename(filePath)}`;

          // If the user already has an avatar, delete the old file
          if (user.avatar) {
            const oldFilePath = path.join(
              __dirname,
              '..',
              '..',
              'public',
              user.avatar,
            );
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
          }
        }

        // Update the user record in the database
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: updatedData,
        });

        return {
          statusCode: HttpStatus.OK,
          message: 'Profile updated successfully',
          data: updatedUser,
        };
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.BAD_REQUEST,
          message: error.message || 'Error updating profile',
          data: null,
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getUserByEmail(req: any, email: string) {
    const tenantId = req.user.tenantId;
    try {
      // Start the transaction
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.tenant_id',${tenantId}, TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return user;
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.BAD_REQUEST,
          message: error.message || 'Error updating profile',
          data: null,
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
  async updateUserLogo(req: any, file: Express.Multer.File) {
    const tenantId = req.user.tenantId;

    try {
      const logoUrl = await this.uploadFileToS3(file, tenantId);
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        const user = await prisma.user.findUnique({
          where: { id: req.user.userId },
        });
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const updatedUser = await prisma.user.update({
          where: { id: req.user.userId },
          data: { avatar: logoUrl },
        });

        return {
          statusCode: HttpStatus.OK,
          message: 'Logo updated successfully',
          data: updatedUser,
        };
      });
    } catch (error) {
      console.error('Error updating logo:', error);
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.BAD_REQUEST,
          message: error.message || 'Error updating logo',
          data: null,
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
  async updateCompanyLogo(req: any, file: Express.Multer.File) {
    const tenantId = req.user.tenantId;

    try {
      const logoUrl = await this.uploadFileToS3(file, tenantId);
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        const company = await prisma.company.findUnique({
          where: { id: tenantId },
        });
        if (!company) {
          throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
        }

        const updatedCompany = await prisma.company.update({
          where: { id: tenantId },
          data: { logo: logoUrl },
        });

        return {
          statusCode: HttpStatus.OK,
          message: 'Logo updated successfully',
          data: updatedCompany,
        };
      });
    } catch (error) {
      console.error('Error updating logo:', error);
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.BAD_REQUEST,
          message: error.message || 'Error updating logo',
          data: null,
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
  async createSuperadminUser(req: any, createUserDto: CreateSuperAdminDto) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.tenant_id', '0', TRUE)`;

        const existingUser = await prisma.user.findUnique({
          where: { email: createUserDto.email },
        });

        if (existingUser) {
          throw new HttpException('Email is already registered.', 400);
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = await prisma.user.create({
          data: {
            name: createUserDto.name,
            email: createUserDto.email,
            phoneCode: createUserDto.phoneCode,
            mobile: createUserDto.mobile,
            password: hashedPassword,
            designation: createUserDto.designation,
            role: 'superadmin',
            status: 'active',
          },
        });

        return {
          user,
        };
      });
    } catch (error) {
      console.error('Error creating superadmin user:', error);
      throw new HttpException(
        error.message || 'Error creating superadmin user',
        error.status || 400,
      );
    }
  }
  async whiteLabelToggle(req: any) {
    const tenantId = req.user.tenantId;
    try {
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        const company = await prisma.company.findUnique({
          where: { id: tenantId },
        });
        if (!company) {
          throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
        }

        const updatedCompany = await prisma.company.update({
          where: { id: tenantId },
          data: { whitelabel: !company.whitelabel },
        });

        return {
          statusCode: HttpStatus.OK,
          message: 'White label updated successfully',
          data: {
            whitelabel: updatedCompany.whitelabel,
          },
        };
      });
    } catch (error) {
      console.error('Error updating white label:', error);
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.BAD_REQUEST,
          message: error.message || 'Error updating white label',
          data: null,
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
 async updateUserVisibility(req: any, dto: UpdateUserVisibilityDto) {
  const tenantId = req.user.tenantId;

  try {
    return await this.prisma.$transaction(async (prisma) => {
      await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
      await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
      await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

      const reqUser = await prisma.user.findUnique({
        where: { id: req.user.userId },
      })
      if (reqUser.role !== 'admin') {
        throw new HttpException('Unauthorized access', HttpStatus.FORBIDDEN);
      }

      const user = await prisma.user.findUnique({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const visibilityFieldMap = {
        checkIn: 'checkInVisibility',
        oneOnOne: 'oneOnOneVisibility',
        performance: 'performanceVisibility',
      };

      const fieldToUpdate = visibilityFieldMap[dto.type];

      if (!fieldToUpdate) {
        throw new HttpException('Invalid visibility type', HttpStatus.BAD_REQUEST);
      }

      const updatedUser = await prisma.user.update({
        where: { id: dto.userId },
        data: {
          [fieldToUpdate]: dto.visibility,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      });

      return updatedUser;
    });
  } catch (error) {
    console.error('Error updating user visibility:', error);
    throw new HttpException(
      {
        statusCode: error.status || HttpStatus.BAD_REQUEST,
        message: error.message || 'Error updating user visibility',
        data: null,
      },
      error.status || HttpStatus.BAD_REQUEST,
    );
  }
}

  /**
   * Returns the explicit structural hierarchy:
   * Admins → Departments → Teams → Users
   */
  async getOrgStructure(tenantId: string) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;

        // 1. Fetch all admin-role users
        const admins = await prisma.user.findMany({
          where: { tenantId, role: 'admin' },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            designation: true,
            role: true,
          },
        });

        // 2. Fetch all departments with their teams and users
        const departments = await prisma.team.findMany({
          where: { tenantId, type: 'department' },
          include: {
            // Department lead
            lead: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                designation: true,
                role: true,
              },
            },
            // Teams inside the department
            departmentTeams: {
              include: {
                lead: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    designation: true,
                    role: true,
                  },
                },
                users: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    designation: true,
                    role: true,
                    teamId: true,
                    departmentId: true,
                  },
                },
              },
            },
            // Users directly in this dept (no team)
            deptUser: {
              where: { teamId: null },
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                designation: true,
                role: true,
              },
            },
          },
        });

        // 3. Users with no dept and no team assignment (unassigned)
        const unassignedUsers = await prisma.user.findMany({
          where: {
            tenantId,
            departmentId: null,
            teamId: null,
            role: { notIn: ['admin'] },
          },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            designation: true,
            role: true,
          },
        });

        return {
          admins,
          departments: departments.map((dept) => ({
            id: dept.id,
            name: dept.name,
            lead: dept.lead,
            teams: dept.departmentTeams.map((team) => ({
              id: team.id,
              name: team.name,
              lead: team.lead,
              users: team.users,
            })),
            directUsers: dept.deptUser,
          })),
          unassignedUsers,
        };
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching organization structure',
        error.status || 400,
      );
    }
  }

}
