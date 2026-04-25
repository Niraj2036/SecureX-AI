import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    try {
      const message = await this.otpService.sendOtp(sendOtpDto);
      return {
        statusCode: 200,
        message,
        data: null,
      };
    } catch (error) {
      return {
        statusCode: error.status || 400,
        message: error.message || 'Failed to send OTP.',
        data: null,
      };
    }
  }

  @Post('verify')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      const message = await this.otpService.verifyOtp(verifyOtpDto);
      return {
        statusCode: 200,
        message,
        data: null,
      };
    } catch (error) {
      return {
        statusCode: error.status || 400,
        message: error.message || 'Failed to verify OTP.',
        data: null,
      };
    }
  }

  @Post('resend')
  async resendOtp(@Body() sendOtpDto: SendOtpDto) {
    try {
      const message = await this.otpService.resendOtp(sendOtpDto);
      return {
        statusCode: 200,
        message,
        data: null,
      };
    } catch (error) {
      return {
        statusCode: error.status || 400,
        message: error.message || 'Failed to resend OTP.',
        data: null,
      };
    }
  }
}
