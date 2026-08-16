// google-oauth.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus, Get } from '@nestjs/common';
import { GoogleAuthService } from './google-oauth.service';

@Controller('google-oauth')
export class GoogleOAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post('google')
  async validateToken(@Body() body: { accessToken: string, idToken?: string }) {
    try {
      const result = await this.googleAuthService.validateGoogleToken(body.accessToken);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.UNAUTHORIZED,
          message: error.message || 'Invalid Google Access Token',
        },
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get()
  async SampleGet(){
    try {
      return {
        message: "Sample GET request",
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Error processing request',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } 
}