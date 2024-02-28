import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { LevelModule } from './level';
import { ContestModule } from './contest';

@Module({
  imports: [PrismaModule, AuthModule, LevelModule, ContestModule],
})
export class AppModule {}
