import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [OauthService],
  controllers: [OauthController],
  imports:[PrismaModule,JwtModule],
})
export class OauthModule {}
