import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SuperAdminPrismaService } from './superAdminprisma.service';

@Module({
  providers: [PrismaService,SuperAdminPrismaService],
  exports: [PrismaService,SuperAdminPrismaService], // Export so it can be used in other modules
})
export class PrismaModule {}
