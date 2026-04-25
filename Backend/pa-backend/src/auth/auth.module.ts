import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [OtpModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
