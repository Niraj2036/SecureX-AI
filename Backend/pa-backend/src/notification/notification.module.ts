import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { ScheduleModule } from "@nestjs/schedule";
import { OtpService } from "src/auth/otp/otp.service";
import { OtpModule } from "src/auth/otp/otp.module";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), OtpModule, MailModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
