import * as jwt from 'jsonwebtoken';

import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    const excludedRoutes = [
      '/api/users/login',
      '/api/users/register',
      '/api/users/login-with-google',
      '/api/users/adminLogin',
    ];

    // Skip middleware for excluded routes
    if (excludedRoutes.includes(req.path)) {
      return next();
    }

    if (!token) {
      throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
    }

    let decodedToken;
    try {
      // Decode the token and extract user details
      decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key',
      ); // Replace with your actual secret key
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const userId = decodedToken.userId;
    const tenantId = decodedToken.tenantId;
    const role = decodedToken.role;

    // Add the decoded token data directly to the request object
    req.user = { userId, tenantId, role }; // You can customize this structure as needed
    req.company = { id: tenantId }; // Assuming tenantId refers to company info

    // Proceed to the next middleware/handler
    next();
  }
}
