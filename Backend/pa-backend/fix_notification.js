
let fs = require("fs");
let f = "src/notification/notification.service.ts";
let code = `
import { Injectable, HttpException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { MailService } from "src/mail/mail.service";
import { OtpService } from "src/auth/otp/otp.service";
import { SchedulerRegistry } from "@nestjs/schedule";
import { sendReminder } from "./dto/sendReminder";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async getAllNotifications(req: any) {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      const [notifications, total] = await Promise.all([
        this.prisma.notification.findMany({
          where: { receiverId: user.id },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.notification.count({ where: { receiverId: user.id } }),
      ]);
      return {
        message: "Notifications fetched successfully",
        data: notifications,
        pagination: { total, page, limit },
      };
    } catch (e) {
      throw new HttpException("Error fetching notifications", 400);
    }
  }

  async markReadById(req: any, notificationId: string) {
    try {
      const notification = await this.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return { message: "Notification marked as read", data: notification };
    } catch (e) {
      throw new HttpException("Error marking notification as read", 400);
    }
  }

  async markAllRead(req: any) {
    const user = req.user;
    try {
      await this.prisma.notification.updateMany({
        where: { receiverId: user.id, isRead: false },
        data: { isRead: true },
      });
      return { message: "All notifications marked as read" };
    } catch (e) {
      throw new HttpException("Error marking all read", 400);
    }
  }

  async sendReminder(req: any, dto: sendReminder) {
    return { message: "Reminder functionality disabled for RAG template" };
  }
}
`;
fs.writeFileSync(f, code.trim());

