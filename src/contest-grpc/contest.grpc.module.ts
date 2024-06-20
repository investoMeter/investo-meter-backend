import { Module } from '@nestjs/common';
import { ContestGrpcController } from './contest.grpc.controller';
import { ContestGrpcService } from './contest.grpc.service';

@Module({
  controllers: [ContestGrpcController],
  providers: [ContestGrpcService],
})
export class ContestGrpcModule {}
