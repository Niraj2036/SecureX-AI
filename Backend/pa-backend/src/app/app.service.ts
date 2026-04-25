import { BadRequestException, HttpException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { SuperAdminPrismaService } from 'src/prisma/superAdminprisma.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private adminPrisma: SuperAdminPrismaService,
  ) {}

  async me(req: any) {
    const userId = req.user.userId;
    const tenantId = req.user.tenantId;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Set the necessary configuration using the raw SQL commands
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        // Fetch user data within the transaction
        const user = await tx.user.findFirst({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            tenantId: true,
            role: true,
            phoneCode: true,
            mobile: true,
            teamId: true,
            departmentId: true,
            managerId: true,
            joiningDate: true,
            designation: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            data: true,
            team: true,
            department: true,
          },
        });

        if (!user) {
          throw new BadRequestException('User not found.');
        }
        // if (user.status === "banned"){
        //     throw new BadRequestException('User is banned.');
        // }
        // if (user.status === "deleted"){
        //     throw new BadRequestException('User is deleted.');
        // }
        await tx.user.update({
          where: { id: userId },
          data: {
            updatedAt: new Date(),
          },
        });

        // Fetch the manager's details if managerId exists, otherwise set all fields to null
        let manager = {
          id: null,
          name: null,
          email: null,
          role: null,
          designation: null,
        };

        if (user.managerId) {
          const managerData = await tx.user.findFirst({
            where: { id: user.managerId },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              designation: true,
            },
          });
          if (managerData) {
            manager = managerData;
          }
        }

        return {
          message: 'User fetched successfully',
          data: {
            ...user,
            manager, // Include the manager's details
          },
        };
      });

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching details',
        error.status || 400,
      );
    }
  }
  async adminMe(req: any) {
    const userId = req.user.userId;

    try {
      const result = await this.adminPrisma.$transaction(async (tx) => {
        // Set the necessary configuration using the raw SQL commands
        // await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        // await tx.$executeRaw`SELECT set_config('app.tenant_id', ${req.user.tenantId}, TRUE)`;
        // await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        // Fetch user data within the transaction
        const user = await tx.user.findFirst({
          where: { id: userId },
          select: {
            id: true,
            avatar: true,
            name: true,
            email: true,
            tenantId: true,
            role: true,
            phoneCode: true,
            mobile: true,
            teamId: true,
            departmentId: true,
            managerId: true,
            joiningDate: true,
            designation: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            data: true,
          },
        });
        if (!user) {
          throw new BadRequestException('User not found.');
        }

        return {
          message: 'User fetched successfully',
          data: user,
        };
      });

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching details',
        error.status || 400,
      );
    }
  }
  async getUserProfileStatics(req: any, sessionId: string) {
    const { userId, tenantId } = req.user;

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) {
          throw new BadRequestException('User not found.');
        }

        // Today's date for calculations
        const today = new Date();

        // Fetch all objectives in a single query based on role
        const objectives = [];

        // Compute values using database data
        const totalObjectives = objectives.length;
        const objectivesFinished = objectives.filter(
          (obj) => obj.progress === 100,
        ).length;
        const objectivesInProgress = objectives.filter(
          (obj) => obj.progress < 100,
        ).length;
        const objectivesBadProgress = objectives.filter((obj) => {
          const startDate = new Date(obj.startDate);
          const endDate = new Date(obj.endDate);
          const timeProgress =
            ((today.getTime() - startDate.getTime()) /
              (endDate.getTime() - startDate.getTime())) *
            100;
          return obj.progress < timeProgress;
        }).length;

        return {
          message: 'Objectives statistics fetched successfully',
          data: {
            totalObjectives,
            objectivesFinished,
            objectivesInProgress,
            objectivesBadProgress,
          },
        };
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching objectives statistics',
        error.status || 400,
      );
    }
  }

  async getUserProfile(req: any, user1Id: string) {
    const { userId, tenantId } = req.user;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Bypass RLS & Set tenant context
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', TRUE)`;

        // Fetch user details
        const user = await tx.user.findFirst({
          where: { id: user1Id },
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            designation: true,
            email: true,
            teamId: true,
            departmentId: true,
            managerId: true,
            team: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
          },
        });

        if (!user) {
          throw new BadRequestException('User not found.');
        }

        // Fetch manager details if managerId exists
        let manager = null;
        if (user.managerId) {
          manager = await tx.user.findFirst({
            where: { id: user.managerId },
            select: { id: true, name: true },
          });
        }

        // Fetch objectives statistics
        const today = new Date();
        const objectives = [];

        // Compute statistics
        const totalObjectives = objectives.length;
        const objectivesFinished = objectives.filter(
          (obj) => obj.progress === 100,
        ).length;
        const objectivesInProgress = objectives.filter(
          (obj) => obj.progress < 100,
        ).length;
        const objectivesBadProgress = objectives.filter((obj) => {
          const startDate = new Date(obj.startDate);
          const endDate = new Date(obj.endDate);
          const timeProgress =
            ((today.getTime() - startDate.getTime()) /
              (endDate.getTime() - startDate.getTime())) *
            100;
          return obj.progress < timeProgress;
        }).length;

        return {
          message: 'User profile fetched successfully',
          data: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            designation: user.designation,
            email: user.email,
            team: user.team ? { id: user.team.id, name: user.team.name } : null,
            department: user.department
              ? { id: user.department.id, name: user.department.name }
              : null,
            manager: manager ? { id: manager.id, name: manager.name } : null,
            statistics: {
              totalObjectives,
              objectivesFinished,
              objectivesInProgress,
              objectivesBadProgress,
            },
          },
        };
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching user profile',
        error.status || 400,
      );
    }
  }
}
