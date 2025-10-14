import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const configService = app.get(ConfigService);
  app.enableCors({
    // origin: configService.get('CORS_ORIGIN') || '*',
    origin: '*', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device-token'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Serve static files (uploads)
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Global prefix
  app.setGlobalPrefix('');

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log('='.repeat(60));
  console.log('Take Care Me Backend Server');
  console.log('='.repeat(60));
  console.log(`Server running on: http://localhost:${port}`);
  console.log(`Environment: ${configService.get('NODE_ENV')}`);
  console.log(`Database: ${configService.get('DB_DATABASE')}`);
  console.log('='.repeat(60));
  // Kiểm tra kết nối SQL Server
  const dataSource = app.get(DataSource);
  try {
    await dataSource.query('SELECT 1');
    console.log('Kết nối SQL Server thành công');
  } catch (err) {
    console.error('Không thể kết nối SQL Server:', err.message);
  }

  console.log('='.repeat(60));
}

bootstrap();