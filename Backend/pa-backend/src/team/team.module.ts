import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthMiddleware } from 'src/auth/middleware/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service'; // Prisma service (or your ORM service)
import { RlsMiddleware } from 'src/auth/middleware/rls.middleware';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Use your secret key here
      signOptions: { expiresIn: '15d' }, // Set the token to expire in 15 days
    }),
    PrismaModule,
  ],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware) // Apply AuthMiddleware to the routes
      .forRoutes(TeamController); // You can specify which routes (or controllers) this middleware applies to
  }
}
