// mail.service.ts

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtpEmail(to: string, otp: string) {
    return this.mailerService.sendMail({
      to,
      subject: 'Your OTP Code',
      template: 'otp',
      context: {
        otp,
      },
    });
  }

  async sendInviteEmail(to: string, projectName: string, inviter: string) {
    return this.mailerService.sendMail({
      to,
      subject: 'You are invited!',
      template: 'invite',
      context: {
        projectName,
        inviter,
      },
    });
  }

  async sendNotificationEmail(to: string, message: string) {
    return this.mailerService.sendMail({
      to,
      subject: 'New Notification',
      template: 'notification',
      context: {
        message,
      },
    });
  }

  async sendReminderEmail(to: string, taskName: string, dueDate: string) {
    return this.mailerService.sendMail({
      to,
      subject: 'Reminder: Upcoming Task',
      template: 'reminder',
      context: {
        taskName,
        dueDate,
      },
    });
  }
}
