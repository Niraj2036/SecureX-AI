import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
  HttpException,
  HttpStatus,
  Req,
  Headers,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { GetAllDto } from './dto/get-all-dto.dto';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}
  @UseGuards(AuthGuard, AdminGuard)
  @Post()
  async create(@Body() createTeamDto: CreateTeamDto, @Req() req: any) {
    try {
      const newTeam = await this.teamService.create(createTeamDto, req);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Team created successfully',
        data: newTeam,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status,
          message: error.message || 'Error creating team',
          data: null,
        },
        error.status,
      );
    }
  }
  @UseGuards(AuthGuard, AdminGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Req() req: any,
  ) {
    // Decode user from the req (set by AuthMiddleware)

    try {
      const updatedTeam = await this.teamService.update(id, updateTeamDto, req);
      if (!updatedTeam) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Team not found or not allowed to update',
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Team updated successfully',
        data: updatedTeam,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status,
          message: error.message || 'Error updating team',
          data: null,
        },
        error.status,
      );
    }
  }
  @Patch(':id/users')
  async updateTeamUsers(
    @Param('id') id: string,
    @Body() body: { userIds: string[] },
    @Req() req: any,
  ) {
    return this.teamService.updateTeamUsers(id, body.userIds, req);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Req() req: any, @Query() dto: GetAllDto) {
    try {
      const teams = await this.teamService.getAll(req, dto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Teams fetched successfully',
        data: teams,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status,
          message: error.message || 'Error fetching teams',
          data: null,
        },
        error.status,
      );
    }
  }
  @UseGuards(AuthGuard)
  @Get('dept')
  async getAllDept(@Req() req: any, @Query() dto: GetAllDto) {
    try {
      const teams = await this.teamService.getAllDept(req, dto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Departments fetched successfully',
        data: teams,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status,
          message: error.message || 'Error fetching teams',
          data: null,
        },
        error.status,
      );
    }
  }
  @UseGuards(AuthGuard)
  @Get('teams/:id')
  async getAllForDept(
    @Req() req: any,
    @Param('id') id: string,
    @Query() dto: GetAllDto,
  ) {
    try {
      const teams = await this.teamService.getAllTeamsForDept(req, id, dto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Teams fetched successfully',
        data: teams,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status,
          message: error.message || 'Error fetching teams',
          data: null,
        },
        error.status,
      );
    }
  }
  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    // Decode user from the req (set by AuthMiddleware)
    try {
      const deletedTeam = await this.teamService.delete(id, req); // Pass both tenantId and userId
      if (!deletedTeam) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Team not found or not allowed to delete',
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Team deleted successfully',
        data: deletedTeam,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status,
          message: error.message || 'Error deleting team',
          data: null,
        },
        error.status,
      );
    }
  }
}
