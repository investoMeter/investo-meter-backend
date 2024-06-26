import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.Module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ClientOptions, Transport } from '@nestjs/microservices';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'contestStatus',
    protoPath: 'src/protos/contestStatus.proto',
  },
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.connectMicroservice(grpcClientOptions);
  await app.startAllMicroservices();

  // Enable CORS with specific options
  const corsOptions: CorsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
  app.enableCors(corsOptions);

  const config = new DocumentBuilder()
    .setTitle('Investometer API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port, () => console.log(`Server is running on port ${port}`));
}

bootstrap();
