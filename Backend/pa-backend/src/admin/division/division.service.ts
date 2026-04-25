import { CreateObjectiveDivision } from './dto/createObjectiveInsideDivision';
import { Injectable } from '@nestjs/common';
import { SuperAdminPrismaService } from 'src/prisma/superAdminprisma.service';
import { createDivisionDto } from './dto/createDivisionDto';

@Injectable()
export class DivisionService {
  constructor(private prisma: SuperAdminPrismaService) {}

  async getAllDivisions(req: any) {
    try {
      const divisions = await this.prisma.division.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          //   objective: true,
        },
      });
      return divisions;
    } catch (error) {
      console.error('Error retrieving divisions:', error);
      throw new Error('Error retrieving divisions');
    }
  }
  async deleteDivision(req: any) {
    const id = req.params.id;

    try {
      const division = await this.prisma.division.findUnique({
        where: { id },
      });
      if (!division) {
        throw new Error('Division not found');
      }
      await this.prisma.division.delete({
        where: { id },
      });
      return division;
    } catch (error) {
      throw new Error('Error deleting division');
    }
  }
  async createDivision(req: any, createDto: createDivisionDto) {
    const { name } = createDto;
    try {
      const existingDivision = await this.prisma.division.findFirst({
        where: { name: name },
      });
      if (existingDivision) {
        throw new Error('Division already exists');
      }
      const division = await this.prisma.division.create({
        data: {
          name,
          createdAt: new Date(),
        },
      });
      return division;
    } catch (error) {
      console.error('Error creating division:', error);
      throw new Error('Error creating division');
    }
  }
  async getDivisionById(req: any) {
    const id = req.params.id;
    try {
      const division = await this.prisma.division.findUnique({
        where: { id },
        });
      if (!division) {
        throw new Error('Division not found');
      }
      return division;
    } catch (error) {
      console.error('Error retrieving division:', error);
      throw new Error('Error retrieving division');
    }
  }
}
