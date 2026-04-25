import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpException,
  Put,
  Param,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { sendReminder } from './dto/sendReminder';

@Controller('notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAll(@Req() req: Request) {
    try {
      const { message, data,pagination } =
        await this.notificationService.getAllNotifications(req);
      return { statusCode: 200, message, data,pagination };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error?.status || 400,
          message: error?.message || 'Error fetching notifications',
          data: null,
        },
        error?.status || 400,
      );
    }
  }

  @Put(':notificationId')
  async markOneRead(
    @Param('notificationId') notificationId: string,
    @Req() req: Request,
  ) {
    try {
      const { message, data } =
        await this.notificationService.markReadById(req, notificationId);
      return { statusCode: 200, message, data };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error?.status || 400,
          message: error?.message || 'Error marking notification as read',
          data: null,
        },
        error?.status || 400,
      );
    }
  }
  @Put()
  async markAllRead(@Req() req: Request) {
    try {
      const { message } = await this.notificationService.markAllRead(req);
      const data = null;
      return { statusCode: 200, message, data };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error?.status || 400,
          message: error?.message || 'Error marking all notification read',
          data: null,
        },
        error?.status || 400,
      );
    }
  }
  @Post('sendReminder')
  async sendReminder(@Req() req: any,@Body() dto:sendReminder) {
    try {
      const { message } = await this.notificationService.sendReminder(req, dto);
      const data = null;
      return { statusCode: 200, message, data };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error?.status || 400,
          message: error?.message || 'Error sending reminder',
          data: null,
        },
        error?.status || 400,
      );
    }
  }
}
