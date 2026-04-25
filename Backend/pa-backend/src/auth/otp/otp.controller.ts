import {
  Controller,
  Post,
  Body,
  Headers,
  Get,
  HttpException,
  HttpCode,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { ResetPasswordDto } from './dto/otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @HttpCode(200)
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    try {
      const message = await this.otpService.sendOtp(sendOtpDto);
      return {
        statusCode: 200,
        message,
        data: null,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Failed to Send otp',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  @Post('verify')
  @HttpCode(200)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      const { message, data } = await this.otpService.verifyOtp(verifyOtpDto);
      return {
        statusCode: 200,
        message,
        data,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Failed to verify otp.',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  @Post('resend')
  @HttpCode(200)
  async resendOtp(@Body() sendOtpDto: SendOtpDto) {
    try {
      const message = await this.otpService.resendOtp(sendOtpDto);
      return {
        statusCode: 200,
        message,
        data: null,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Failed to resend otp',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() body: any) {
    const { newPassword, token } = body;
    try {
      // Extract the Bearer token from the Authorization header

      // Call the service to reset the password
      const message = await this.otpService.resetPassword(newPassword, token);

      return {
        statusCode: 200,
        message,
        data: null,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Failed to reset password.',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  @Get('send-invite-otp')
  @HttpCode(200)
  async sendInviteOtp(@Headers('authorization') authHeader: string) {
    try {
      // Extract the Bearer token from the Authorization header
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Invalid token.');
      }

      const token = authHeader.split(' ')[1];
      // Call the service to reset the password
      return await this.otpService.sendInviteOtp(token);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Failed to send otp.',
          data: null,
        },
        error.status || 400,
      );
    }
  }
}
