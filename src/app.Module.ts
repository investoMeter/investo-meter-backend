import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { LevelModule } from './level';
import { ContestModule } from './contest';
import { ReportModule } from './report/report/report.module';


@Module({ 
  imports: [PrismaModule, AuthModule, LevelModule, ContestModule,ReportModule],
})
export class AppModule {}
