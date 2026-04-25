import { Module } from '@nestjs/common';
import { GoogleAuthService } from './google-oauth.service';
import { GoogleOAuthController } from './google-oauth.controller';

@Module({
  controllers: [GoogleOAuthController],
  providers: [GoogleAuthService],
})
export class UsersModule {}