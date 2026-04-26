import {
  Module,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { CloudinaryService } from './cloudinary.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from 'src/auth/middleware/auth.middleware';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [DocumentController],
  providers: [DocumentService, CloudinaryService],
  exports: [DocumentService],
})
export class DocumentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(DocumentController);
  }
}
