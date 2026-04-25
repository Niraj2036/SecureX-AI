import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { companyController, UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from 'src/auth/middleware/auth.middleware';
import { GoogleAuthService } from './google-oauth.service';
import { OtpModule } from 'src/auth/otp/otp.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Use your secret key here
      signOptions: { expiresIn: '15d' }, // Set the token to expire in 15 days
    }),
    PrismaModule,AuthModule,OtpModule
  ],
  controllers: [UsersController,companyController],
  providers: [UsersService, GoogleAuthService],
  exports: [UsersService, GoogleAuthService],
})
export class UsersModule implements NestModule {
  // Implement the configure method to apply middleware
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware) // Apply the middleware
      .exclude(
        { path: 'users/login', method: RequestMethod.POST },
        { path: 'users/register', method: RequestMethod.POST },
      )
      .forRoutes(UsersController,companyController); 
  }
}
