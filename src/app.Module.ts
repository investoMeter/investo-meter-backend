import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { LevelModule } from './level';
import { ContestModule } from './contest';
import { FeedbackModule } from './feedback/feedback.module';
import { HintModule } from './hint';
import { ReportModule } from './report/report.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProfileModule } from './profile/profile.module';
import { ContestGrpcModule } from './contest-grpc/contest.grpc.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LevelModule,
    ContestModule,
    HintModule,
    FeedbackModule,
    ReportModule,
    ProfileModule,
    ScheduleModule.forRoot(),
    ContestGrpcModule,
  ],
})
export class AppModule {}
