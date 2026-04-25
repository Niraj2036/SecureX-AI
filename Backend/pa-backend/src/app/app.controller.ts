import {
  Controller,
  Get,
  UseGuards,
  Req,
  HttpException,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    try {
      const { message, data } = await this.appService.me(req);
      return { statusCode: 201, message, data };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching details',
          data: null,
        },
        error.status,
      );
    }
  }
  @UseGuards(AdminAuthGuard)
  @Get('adminMe')
  async adminMe(@Req() req: any) {
    try {
      const { message, data } = await this.appService.adminMe(req);
      return { statusCode: 201, message, data };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching details',
          data: null,
        },
        error.status,
      );
    }
  }
  @UseGuards(AuthGuard)
  @Get('myStatics')
  async myStatics(@Req() req: any, @Query() sessionId: string) {
    try {
      const { message, data } = await this.appService.getUserProfileStatics(
        req,
        sessionId,
      );
      return { statusCode: 201, message, data };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching details',
          data: null,
        },
        error.status,
      );
    }
  }
  @UseGuards(AuthGuard)
  @Get('userDetails/:id')
  async userDetails(@Req() req: any, @Param('id') id: string) {
    try {
      const { message, data } = await this.appService.getUserProfile(req, id);
      return { statusCode: 201, message, data };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching details',
          data: null,
        },
        error.status,
      );
    }
  }
}
