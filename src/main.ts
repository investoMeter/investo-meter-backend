import { NestFactory } from '@nestjs/core';
import { appModule } from './app.Module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(appModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3333);
}
bootstrap();
