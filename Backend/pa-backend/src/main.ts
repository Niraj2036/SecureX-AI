import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
 
async function bootstrap() {
  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('SecureXAi API')
    .setVersion('1.0')
    .setBasePath('api')
    .addBearerAuth() 
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  

  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

