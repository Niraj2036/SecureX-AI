import * as jwt from 'jsonwebtoken';

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

      if (decoded.role !== 'superadmin') {
        throw new HttpException('Admin access required', HttpStatus.FORBIDDEN);
      }

      request.user = decoded;

      return true;
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
