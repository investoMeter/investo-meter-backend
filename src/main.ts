import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.Module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3333);
}
bootstrap();
