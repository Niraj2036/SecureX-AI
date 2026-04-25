import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Transporter } from 'nodemailer';

type OtpReason = 'verify_user' | 'reset_pass' | 'invite_verify' | string;
type OtpStatus = 'active' | 'expired' | 'used';

interface OtpConfig {
  length: number;
  expiryMinutes: number;
  charset?: string;
  numericOnly?: boolean;
}

interface EmailConfig {
  service: string;
  host?: string;
  port?: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

@Injectable()
export class OtpService {
  private readonly otpConfig: OtpConfig;
  private readonly emailConfig: EmailConfig;
  private emailTransporter: Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Initialize OTP configuration
    this.otpConfig = {
      length: this.configService.get<number>('OTP_LENGTH', 6),
      expiryMinutes: this.configService.get<number>('OTP_EXPIRY_MINUTES', 5),
      numericOnly: this.configService.get<boolean>('OTP_NUMERIC_ONLY', true),
    };

    this.emailConfig = {
      service: this.configService.get<string>('EMAIL_SERVICE', 'Gmail'),
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE', true),
      auth: {
        user: this.configService.get<string>('EMAIL_USERNAME'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    };

    this.emailTransporter = nodemailer.createTransport(this.emailConfig);
  }

  private generateOtp(): string {
    if (this.otpConfig.numericOnly) {
      const min = Math.pow(10, this.otpConfig.length - 1);
      const max = Math.pow(10, this.otpConfig.length) - 1;
      return crypto.randomInt(min, max).toString();
    }

    const charset =
      this.otpConfig.charset ||
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = '';
    for (let i = 0; i < this.otpConfig.length; i++) {
      otp += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return otp;
  }
  async sendEmailReminder(email: string, message: string) {
    try {
      await this.emailTransporter.sendMail({
        from: this.emailConfig.auth.user,
        to: email,
        subject: 'Reminder',
        html: message,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  async sendEmailForSechedule(
    email: string,
    subject: string,
    message: string,
  ): Promise<void> {
    try {
      await this.emailTransporter.sendMail({
        from: this.emailConfig.auth.user,
        to: email,
        subject: subject,
        html: message,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }



  private async sendEmail(
    email: string,
    otp: string,
    reason: OtpReason,
  ): Promise<void> {
    let subject = 'OTP Verification';
    let messageText = `Your OTP is: ${otp}`;

    switch (reason) {
      case 'verify_user':
        subject = 'Account Verification OTP';
        messageText = `Your account verification OTP is: ${otp}`;
        break;
      case 'reset_pass':
        subject = 'Password Reset OTP';
        messageText = `Your password reset OTP is: ${otp}. This OTP will expire in ${this.otpConfig.expiryMinutes} minutes.`;
        break;
      case 'invite_verify':
        subject = 'Invitation Verification OTP';
        messageText = `Your invitation verification OTP is: ${otp}`;
        break;
    }

    const emailHtml = `
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
              .email-footer {
                  text-align: center;
                  font-size: 12px;
                  color: #777777;
                  margin-top: 20px;
              }
              .logo {
                  font-size: 20px;
                  font-weight: 700;
                  color: #084545;
                  margin-bottom: 20px;
              }
              .otp-box {
                  font-size: 20px;
                  font-weight: bold;
                  background: #eef6f6;
                  padding: 10px;
                  border-radius: 6px;
                  margin: 15px 0;
                  color: #084545;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="email-nav">
                <div class="logo">SecureXai</div>
              </div>
              <div class="email-header">${subject}</div>
              <div class="email-body">
                  <p>${messageText}</p>
                  <div class="otp-box">${otp}</div>
              </div>
              <div class="email-footer">
                  This is an automated message. If you did not request this OTP, please ignore this email.
              </div>
          </div>
      </body>
      </html>
    `;

    await this.emailTransporter.sendMail({
      from: this.emailConfig.auth.user,
      to: email,
      subject,
      html: emailHtml,
    });
  }

  async sendOtp(body: { email: string; reason: OtpReason }): Promise<string> {
    try {
      return await this.prisma.$transaction(
        async (prisma) => {
          await this.setPrismaContext(prisma);

          const { email, reason } = body;
          const user = await prisma.user.findFirst({ where: { email } });

          if (!user) {
            throw new HttpException(
              'User does not exist.',
              HttpStatus.BAD_REQUEST,
            );
          }

          const otpValue = this.generateOtp();
          const expiryTime = new Date(
            Date.now() + this.otpConfig.expiryMinutes * 60 * 1000,
          );

          await prisma.otp.updateMany({
            where: { userEmail: email, status: 'active' },
            data: { status: 'expired' },
          });

          await prisma.otp.create({
            data: {
              userEmail: email,
              otpValue,
              tenantId: user.tenantId,
              reason,
              expiryTime,
              status: 'active',
            },
          });

          await this.sendEmail(email, otpValue, reason);

          return 'OTP sent successfully.';
        },
        {
          maxWait: 5000,
          timeout: 10000,
        },
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send OTP',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyOtp(body: { email: string; otp: string }): Promise<any> {
    const { email, otp } = body;

    try {
      return await this.prisma.$transaction(async (prisma) => {
        await this.setPrismaContext(prisma);

        const otps = await prisma.otp.findMany({
          where: { userEmail: email, status: 'active' },
          orderBy: { createdAt: 'desc' },
        });

        if (otps.length === 0) {
          throw new HttpException('Invalid OTP.', HttpStatus.BAD_REQUEST);
        }

        await this.expireOldOtps(prisma, otps);

        const validOtps = await prisma.otp.findMany({
          where: { userEmail: email, status: 'active' },
          orderBy: { createdAt: 'desc' },
        });

        if (validOtps.length === 0) {
          throw new HttpException('OTP has expired.', HttpStatus.BAD_REQUEST);
        }

        const latestOtp = validOtps[0];
        if (latestOtp.otpValue !== otp) {
          throw new HttpException('Invalid OTP.', HttpStatus.BAD_REQUEST);
        }

        await prisma.otp.update({
          where: { id: latestOtp.id },
          data: { status: 'used' },
        });

        return this.handleOtpVerification(prisma, latestOtp, email);
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'OTP verification failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async setPrismaContext(prisma: any) {
    await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
    await prisma.$executeRaw`SELECT set_config('app.tenant_id', '0', TRUE)`;
  }

  private async expireOldOtps(prisma: any, otps: any[]) {
    const expirationPromises = otps.map((otpRecord) => {
      if (new Date(otpRecord.expiryTime).getTime() < Date.now()) {
        return prisma.otp.update({
          where: { id: otpRecord.id },
          data: { status: 'expired' },
        });
      }
    });
    await Promise.all(expirationPromises);
  }

  private async handleOtpVerification(
    prisma: any,
    otpRecord: any,
    email: string,
  ) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException('User does not exist.', HttpStatus.BAD_REQUEST);
    }

    switch (otpRecord.reason) {
      case 'verify_user':
        return this.handleUserVerification(prisma, user);
      case 'reset_pass':
      case 'invite_verify':
        return this.handlePasswordResetOrInvite(prisma, user, otpRecord.reason);
      default:
        throw new HttpException(
          'Invalid reason for OTP.',
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private async handleUserVerification(prisma: any, user: any) {
    if (user.status === 'not_verified') {
      await prisma.user.update({
        where: { email: user.email },
        data: { status: 'active' },
      });
    }
    return { message: 'OTP verification successful.', data: null };
  }

  private async handlePasswordResetOrInvite(
    prisma: any,
    user: any,
    reason: OtpReason,
  ) {
    if (reason === 'invite_verify' && user.status === 'pending') {
      await prisma.user.update({
        where: { email: user.email },
        data: { status: 'active' },
      });
    }

    const payload = { id: user.id };
    const token = jwt.sign(
      payload,
      this.configService.get<string>('PASS_SECRET'),
      {
        expiresIn: '15m',
      },
    );

    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        tenantId: user.tenantId,
        status: 'unused',
        createdAt: new Date(),
        expiresAt: expiryTime,
      },
    });

    return {
      message: 'OTP verification Successful',
      data: { token },
    };
  }

  async resendOtp(body: { email: string; reason: OtpReason }): Promise<string> {
    try {
      return this.sendOtp(body);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to resend OTP',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(newPassword: string, token: string): Promise<string> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        await this.setPrismaContext(prisma);

        let decodedToken;
        try {
          decodedToken = jwt.verify(
            token,
            this.configService.get<string>('PASS_SECRET'),
          );
        } catch (error) {
          throw new HttpException(
            'Invalid or expired token.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const userId = decodedToken.id;
        const passwordResetRecord = await prisma.passwordResetToken.findFirst({
          where: { userId, token, status: 'unused' },
          orderBy: { createdAt: 'desc' },
        });

        if (!passwordResetRecord) {
          throw new HttpException(
            'Invalid or expired token.',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (new Date(passwordResetRecord.expiresAt).getTime() < Date.now()) {
          await prisma.passwordResetToken.update({
            where: { id: passwordResetRecord.id },
            data: { status: 'expired' },
          });
          throw new HttpException('Token has expired.', HttpStatus.BAD_REQUEST);
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user password
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          throw new HttpException('User not found.', HttpStatus.BAD_REQUEST);
        }

        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });

        await prisma.passwordResetToken.update({
          where: { id: passwordResetRecord.id },
          data: { status: 'used' },
        });

        return 'Password has been successfully reset.';
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Password reset failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendInviteOtp(token: string) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        await this.setPrismaContext(prisma);

        // Verify invitation token
        let userId: string;
        try {
          const payload = this.jwtService.verify(token, {
            secret: this.configService.get<string>('INVITE_SECRET'),
          });
          userId = payload.userId;
        } catch {
          throw new HttpException(
            'Invalid or expired token.',
            HttpStatus.UNAUTHORIZED,
          );
        }

        // Get user details
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          throw new HttpException(
            'User does not exist.',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (user.status !== 'pending') {
          throw new HttpException('Token has expired.', HttpStatus.BAD_REQUEST);
        }

        // Generate and store OTP
        const otpValue = this.generateOtp();
        const expiryTime = new Date(
          Date.now() + this.otpConfig.expiryMinutes * 60 * 1000,
        );

        await prisma.otp.updateMany({
          where: { userEmail: user.email, status: 'active' },
          data: { status: 'expired' },
        });

        await prisma.otp.create({
          data: {
            userEmail: user.email,
            otpValue,
            tenantId: user.tenantId,
            reason: 'invite_verify',
            expiryTime,
            status: 'active',
          },
        });

        // Send OTP via email (commented out as per original)
        await this.sendEmail(user.email, otpValue, 'invite_verify');

        return {
          statusCode: 200,
          message: 'OTP sent successfully',
          data: { email: user.email },
        };
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send invitation OTP',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

