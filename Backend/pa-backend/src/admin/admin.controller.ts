import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { InviteUserDto } from 'src/users/dto/invite-user.dto';

@UseGuards(AdminAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('companys')
  async getAllCompanys(@Req() req: any) {
    try {
      const companys = await this.adminService.getAllCompanys(req);
      console.log(companys);
      return {
        statusCode: 200,
        message: 'Companys retrieved successfully',
        data: companys,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error retrieving companys',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Get('companys/:id')
  async getCompanyById(@Req() req: any) {
    try {
      const company = await this.adminService.getCompanyById(req.params.id);
      return company;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error retrieving company',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Get('users/:id')
  async getUsersByCompanyId(@Req() req: any) {
    try {
      const users = await this.adminService.getUserDetails(req.params.id);
      return users;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error retrieving users',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Get('users')
  async getAllUsers(@Req() req: any) {
    try {
      const users = await this.adminService.getAllUsers(req);
      return users;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error retrieving users',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Patch('users/:id/ban')
  async banUser(@Req() req: any) {
    try {
      const user = await this.adminService.banUser(req);
      return user;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error banning user',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Delete('users/:id/delete')
  async deleteUser(@Req() req: any) {
    try {
      const user = await this.adminService.deleteUser(req);
      return user;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error deleting user',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Get(':id/teams')
  async getTeamsByCompanyId(@Param('id') id: string, @Req() req: any) {
    req.query.companyId = id; //
    try {
      const teams = await this.adminService.getAllTeams(req);
      return teams;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error retrieving teams',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @UseGuards(AuthGuard)
  @Post('invite')
  async inviteUser(@Body() inviteUserDto: InviteUserDto, @Req() req: any) {
    try {
      return await this.adminService.InviteUser(req,inviteUserDto);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error inviting user',
          data: null,
        },
        error.status,
      );
    }
  }
}
