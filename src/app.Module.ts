import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { LevelModule } from './level';
import { ContestModule } from './contest';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [PrismaModule, AuthModule, LevelModule, ContestModule,FeedbackModule],
})
export class AppModule {}
