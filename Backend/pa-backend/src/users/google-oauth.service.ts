// import { OAuth2Client } from 'google-auth-library';
// import { Injectable, UnauthorizedException } from '@nestjs/common';

// @Injectable()
// export class GoogleAuthService {
//     private readonly oauthClient: OAuth2Client;

//     constructor() {
//         this.oauthClient = new OAuth2Client(
//             '162335203657-ndami0tra0p32vgldirbd3rl0i7v73jr.apps.googleusercontent.com',
//         );
//     }

//     async validateGoogleAccessToken(accessToken: string): Promise<string> {
//
//         const ticket = await this.oauthClient.verifyIdToken({
//             idToken: accessToken,
//             audience: '162335203657-ndami0tra0p32vgldirbd3rl0i7v73jr.apps.googleusercontent.com', // Your client ID
//         });
//
//         try {

//             const payload = ticket.getPayload();

//             if (!payload || !payload.email) {
//                 throw new UnauthorizedException('Invalid Google token');
//             }

//             return payload.email;
//         } catch (error) {

//             throw new UnauthorizedException('Invalid1 Google token');
//         }
//     }
// }
// google-oauth.service.ts

import * as bcrypt from 'bcrypt';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';

// google-oauth.service.ts
@Injectable()
export class GoogleAuthService {
  private readonly googleTokenInfoURL =
    'https://www.googleapis.com/oauth2/v3/tokeninfo';
  private readonly googleUserInfoURL =
    'https://www.googleapis.com/oauth2/v2/userinfo';

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateGoogleToken(accessToken: string, idToken?: string) {
    try {
      // First verify the token with Google

      const tokenInfo = await axios.get(
        `${this.googleTokenInfoURL}?access_token=${accessToken}`,
      );

      // Then get user info
      const userInfo = await axios.get(this.googleUserInfoURL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Verify the tokens match
      if (tokenInfo.data?.email !== userInfo.data?.email) {
        throw new Error('Token validation failed');
      }

      // Find or create user in your database
      const user = await this.findOrCreateUser({
        email: userInfo.data.email,
        name: userInfo.data.name,
        image: userInfo.data.picture,
      });

      // Generate JWT token (same format as email login)
      const token = this.jwtService.sign(
        {
          userId: user.id,
          tenantId: user.tenantId,
          role: user.role,
        },
        { secret: process.env.JWT_SECRET },
      );

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
      console.error('Google token validation error:', error);
      return { success: false, error: 'Invalid Google token' };
    }
  }

  private async findOrCreateUser(userData: {
    email: string;
    name: string;
    image?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });
    return user;
  }
}
