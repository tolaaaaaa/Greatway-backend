import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IApp } from './config/app.config';
import helmet from 'helmet';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ISwagger, setupSwagger } from './config/swagger.config';
import express from "express"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);
  const PORT = configService.get<IApp>('app')?.port as number;

  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ limit: '500mb', extended: true }));

  app.enableCors({ origin: '*', credentials: true });
  app.setGlobalPrefix('api/', { exclude: [''] });
  app.use(helmet());
  app.use(compression());

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  setupSwagger(app, configService.get<ISwagger>('swagger')!);

  await app.listen(PORT);
}
bootstrap();
