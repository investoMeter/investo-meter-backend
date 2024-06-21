import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { HintService } from './hint.service';
import { HintController } from './hint.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HintFacade } from './hint.facade';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'HINT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: '',
          protoPath: 'src/protos/hint.proto',
          url: 'localhost:50051',
        },
      },
    ]),
  ],
  providers: [HintService, HintFacade],
  controllers: [HintController],
})
export class HintModule {}
