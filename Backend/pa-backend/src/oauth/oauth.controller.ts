// oauth.controller.ts
import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OauthService } from './oauth.service';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Post('google')
  async validateToken(
    @Body()
    body: {
      accessToken: string;
      idToken?: string;
      email?: string;
      name?: string;
      image?: string;
    },
  ) {
    try {
      const result = await this.oauthService.validateGoogleToken(
        body.accessToken,
        body.idToken,
        body.email,
        body.name,
        body.image,
      );

      if (!result.success) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: result.error,
            action:
              result.error === 'User not found in our system'
                ? 'register'
                : 'retry',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Authentication successful',
        data: {
          token: result.token,
          user: result.user,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Authentication error',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('microsoft')
  async validateMicrosoft(
    @Body()
    body: {
      accessToken: string;
      idToken?: string;
      email?: string;
      name?: string;
      image?: string;
    },
  ) {
    try {
      const result = await this.oauthService.validateMicrosoftToken(
        body.accessToken,
        body.idToken,
        body.email,
        body.name,
        body.image,
      );

      if (!result.success) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: result.error,
            action:
              result.error === 'User not found in our system'
                ? 'register'
                : 'retry',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Authentication successful',
        data: {
          token: result.token,
          user: result.user,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Authentication error',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
