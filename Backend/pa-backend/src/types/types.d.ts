import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Adjust type according to your User model
      company?: any; // Adjust type according to your Company model
    }
  }
}
