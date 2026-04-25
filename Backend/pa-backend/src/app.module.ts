import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { TeamModule } from './team/team.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { OauthModule } from './oauth/oauth.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public/images/profile'),
      serveRoot: '/public/images/profile',
    }),
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    UsersModule,
    AuthModule,
    TeamModule,
    PrismaModule,
    NotificationModule,
    ScheduleModule.forRoot(),
    AdminModule,
    OauthModule
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}
