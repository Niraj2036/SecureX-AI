import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.INVITE_SECRET })],
  providers: [OtpService, PrismaService],
  controllers: [OtpController],
  exports:[OtpService]
})
export class OtpModule {}
