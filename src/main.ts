import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfig } from './core/config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get centralized ConfigService
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  // Enable CORS using centralized AppConfig
  app.enableCors({
    origin: appConfig?.corsOrigins || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configure Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Engineers Clinic API')
    .setDescription(
      'REST API documentation for Engineers Clinic platform (Authentication, Users, Colleges, Students & Catalog)',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const baseUrl = appConfig?.baseUrl || 'http://localhost';
  const port = appConfig?.port || 4000;
  await app.listen(port);
  console.log(`🚀 Engineers Clinic Backend running on ${baseUrl}:${port}`);
  console.log(`📚 Swagger API Documentation available on ${baseUrl}:${port}/api/docs`);
}
bootstrap();
