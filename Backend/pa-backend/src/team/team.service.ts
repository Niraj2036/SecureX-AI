import * as jwt from 'jsonwebtoken';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { BadRequestException } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { GetAllDto } from './dto/get-all-dto.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service'; // Assuming you have a PrismaService to interact with Prisma
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Create a new team
  // Create a team
  async create(createTeamDto: CreateTeamDto, req: any, bypass = false) {
    const user1 = req.user; // Populated by AuthMiddleware
    const userId = user1.userId;
    const tenantId = user1.tenantId;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Set bypass RLS and tenant_id
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;
        const newTeam = await tx.team.create({
          data: {
            name: createTeamDto.name,
            // leadId: createTeamDto.leadId,
            parentId: createTeamDto.parentId,
            departmentId: createTeamDto.parentId,
            type: createTeamDto.type,
            tenantId: tenantId,
          },
        });
        // const teamId = newTeam.id;
        // await tx.user.update({
        //   where: { id: userId },
        //   data: {
        //     teamId: teamId,
        //   },
        // });

        return newTeam;
      });
    } catch (error) {
      throw new HttpException(
        'Error creating team: ' + error.message,
        error.status,
      );
    }
  }

  // Update a team
  async update(
    id: string,
    updateTeamDto: UpdateTeamDto,
    req: any,
    bypass = false,
  ) {
    const user1 = req.user; // Populated by AuthMiddleware
    const userId = user1.userId;
    const tenantId = user1.tenantId;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Set bypass RLS and tenant_id
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        const existingTeam = await tx.team.findUnique({
          where: { id },
        });

        if (!existingTeam) {
          throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
        }

        // Check tenantId to ensure tenant isolation
        if (existingTeam.tenantId !== tenantId) {
          throw new HttpException(
            'You are not authorized to update this team',
            HttpStatus.FORBIDDEN,
          );
        }

        const updatedTeam = await tx.team.update({
          where: { id },
          data: {
            name: updateTeamDto.name ?? existingTeam.name,
            leadId: updateTeamDto.leadId ?? existingTeam.leadId,
            parentId: updateTeamDto.parentId ?? existingTeam.parentId,
            departmentId: updateTeamDto.parentId ?? existingTeam.parentId,
            type: updateTeamDto.type ?? existingTeam.type,
          },
        });

        // Disable bypass RLS

        return updatedTeam;
      });
    } catch (error) {
      throw new HttpException(
        'Error updating team: ' + error.message,
        error.status,
      );
    }
  }
  async updateTeamUsers(id: string, userIds: string[], req: any) {
    const tenantId = req.user.tenantId;

    return await this.prisma.$transaction(async (tx) => {
      // Set tenant context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;

      // Verify team exists and belongs to tenant
      const team = await tx.team.findUnique({
        where: { id },
      });

      if (!team || team.tenantId !== tenantId) {
        throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
      }

      // Update team users
      await tx.team.update({
        where: { id },
        data: {
          users: {
            set: userIds.map((id) => ({ id })),
          },
        },
      });

      // Return updated team with users
      return tx.team.findUnique({
        where: { id },
        include: { users: true },
      });
    });
  }

  async getAll(req: any, dto: GetAllDto, bypass = false) {
    const tenantId = req.user.tenantId;
    const { search, pageNo, pageSize = 10 } = dto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        const whereCondition: any = { type: 'team' };
        if (search) {
          whereCondition.name = { contains: search, mode: 'insensitive' };
        }

        let teams;
        let totalCount = await tx.team.count({ where: whereCondition });

        if (pageNo) {
          const skip = (pageNo - 1) * pageSize;
          const take = pageSize;

          teams = await tx.team.findMany({
            where: whereCondition,
            include: {
              parent: true,
              users: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  email: true,
                },
              },
            },
            skip,
            take,
          });

          const totalPages = Math.ceil(totalCount / pageSize);
          const remainingPages = totalPages - pageNo;

          return {
            data: await this.appendLeadDetails(tx, teams),
            pagination: {
              currentPage: pageNo,
              totalPages,
              totalTeams: totalCount,
              remainingPages,
            },
          };
        } else {
          teams = await tx.team.findMany({
            where: whereCondition,
            include: {
              parent: true,
              users: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  email: true,
                },
              },
            },
          });

          return { data: await this.appendLeadDetails(tx, teams) };
        }
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching teams',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete a team
  async delete(id: string, req: any, bypass = false) {
    const user1 = req.user; // Populated by AuthMiddleware
    const userId = user1.userId;
    const tenantId = user1.tenantId;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Set bypass RLS and tenant_id
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;
        const team = await tx.team.findUnique({
          where: { id },
        });

        if (!team) {
          throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
        }

        // Ensure the team belongs to the current tenant
        if (team.tenantId !== tenantId) {
          throw new HttpException(
            'You are not authorized to delete this team',
            HttpStatus.FORBIDDEN,
          );
        }

        // Perform the deletion
        await tx.team.delete({
          where: { id },
        });

        // Disable bypass RLS

        return { id }; // Return the deleted team ID as confirmation
      });
    } catch (error) {
      throw new HttpException(
        'Error deleting team: ' + error.message,
        error.status,
      );
    }
  }
  async getAllDept(req: any, dto: GetAllDto, bypass = false) {
    const { search, pageNo, pageSize = 10 } = dto;
    const user1 = req.user;
    const tenantId = user1.tenantId;

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        // Construct search condition
        const whereCondition: any = { type: 'department' };
        if (search) {
          whereCondition.name = { contains: search, mode: 'insensitive' };
        }

        let departments;
        let totalCount = await tx.team.count({ where: whereCondition });

        if (pageNo) {
          const skip = (pageNo - 1) * pageSize;
          const take = pageSize;

          departments = await tx.team.findMany({
            where: whereCondition,
            include: {
              parent: true,
              users: {
                select: { id: true, name: true, avatar: true, email: true },
              },
            },
            skip,
            take,
          });

          const totalPages = Math.ceil(totalCount / pageSize);
          const remainingPages = totalPages - pageNo;

          return {
            data: await this.appendLeadDetails(tx, departments),
            pagination: {
              currentPage: pageNo,
              totalPages,
              totalTeams: totalCount,
              remainingPages,
            },
          };
        } else {
          departments = await tx.team.findMany({
            where: whereCondition,
            include: {
              parent: true,
              departmentTeams: true,
              users: {
                select: { id: true, name: true, avatar: true, email: true },
              },
            },
          });

          return {
            data: await this.appendLeadDetails(tx, departments),
            pagination: null,
          };
        }
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching departments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async appendLeadDetails(tx: any, departments: any[]) {
    const leadIds = departments.map((dept) => dept.leadId).filter((id) => id);
    if (leadIds.length === 0) return departments;

    const leads = await tx.user.findMany({
      where: { id: { in: leadIds } },
      select: { id: true, name: true, avatar: true, email: true },
    });

    const leadMap = new Map(leads.map((lead) => [lead.id, lead]));

    return departments.map((dept) => ({
      ...dept,
      lead: dept.leadId ? leadMap.get(dept.leadId) || null : null,
    }));
  }

  async getAllTeamsForDept(req: any, departmentId: string, dto: GetAllDto) {
    const { search, pageNo, pageSize = 10 } = dto;
    const user1 = req.user;
    const tenantId = user1.tenantId;

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        // Construct search condition
        const whereCondition: any = { type: 'team', departmentId };
        if (search) {
          whereCondition.name = { contains: search, mode: 'insensitive' };
        }

        let teams;
        let totalCount = await tx.team.count({ where: whereCondition });

        if (pageNo) {
          const skip = (pageNo - 1) * pageSize;
          const take = pageSize;

          teams = await tx.team.findMany({
            where: whereCondition,
            include: {
              parent: true,
              users: {
                select: { id: true, name: true, avatar: true, email: true },
              },
            },
            skip,
            take,
          });

          const totalPages = Math.ceil(totalCount / pageSize);
          const remainingPages = totalPages - pageNo;

          return {
            data: await this.appendLeadDetails(tx, teams),
            pagination: {
              currentPage: pageNo,
              totalPages,
              totalTeams: totalCount,
              remainingPages,
            },
          };
        } else {
          teams = await tx.team.findMany({
            where: whereCondition,
            include: {
              parent: true,
              users: {
                select: { id: true, name: true, avatar: true, email: true },
              },
            },
          });

          return {
            data: await this.appendLeadDetails(tx, teams),
            pagination: null,
          };
        }
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching teams',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
