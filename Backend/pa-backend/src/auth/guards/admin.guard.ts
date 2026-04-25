import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // This is set by the AuthMiddleware

    // Check if the user has an admin role
    if (user.role !== 'admin') {
      throw new HttpException(
        'Access denied: Admin only route',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
