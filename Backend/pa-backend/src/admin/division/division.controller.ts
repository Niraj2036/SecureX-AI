import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { DivisionService } from './division.service';
import { createDivisionDto } from './dto/createDivisionDto';

@UseGuards(AdminAuthGuard)
@Controller('division')
export class DivisionController {
  constructor(private readonly divisionController: DivisionService) {}

  @Get()
  async GetDivisions(@Req() req: any) {
    try {
      const divisions = await this.divisionController.getAllDivisions(req);
      return {
        statusCode: 200,
        message: 'Divisions retrieved successfully',
        data: divisions,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error retrieving divisions',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Post('create')
  async createDivision(@Req() req: any, @Body() createDto: createDivisionDto) {
    try {
      const division = await this.divisionController.createDivision(
        req,
        createDto,
      );
      return {
        statusCode: 200,
        message: 'Division created successfully',
        data: division,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error creating division',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Delete(':id')
  async deleteDivision(@Req() req: any) {
    try {
      const division = await this.divisionController.deleteDivision(req);
      return {
        statusCode: 200,
        message: 'Division deleted successfully',
        data: division,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error deleting division',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Get(':id')
  async getDivisionById(@Req() req: any) {
    try {
      const division = await this.divisionController.getDivisionById(req);
      return {
        statusCode: 200,
        message: 'Division retrieved successfully',
        data: division,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error retrieving division',
          data: null,
        },
        error.status || 400,
      );
    }
  }
}
