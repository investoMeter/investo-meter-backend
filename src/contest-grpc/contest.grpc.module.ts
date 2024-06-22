import { Module } from '@nestjs/common';
import { ContestGrpcController } from './contest.grpc.controller';
import { ContestGrpcService } from './contest.grpc.service';
import { ContestService } from 'src/contest/contest.service';
import { PrismaService } from 'src/prisma';

@Module({
  controllers: [ContestGrpcController],
  providers: [ContestGrpcService, ContestService, PrismaService],
})
export class ContestGrpcModule {}
