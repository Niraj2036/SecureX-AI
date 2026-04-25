// src/middleware/rls.middleware.ts

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

@Injectable()
export class RlsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user; // The user object is set by AuthMiddleware
    const tenantId = req.company.id;
    const db = new PrismaClient();

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }

    // Set the tenant_id in PostgreSQL session
    // Assuming you're using Prisma for database access
    db.$queryRawUnsafe(`SET app.tenant_id = '${tenantId}'`);

    next();
  }
}
