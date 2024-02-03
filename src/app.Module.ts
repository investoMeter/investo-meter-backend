import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LevelModule } from './level/level.module';

@Module({
  imports: [PrismaModule, AuthModule, LevelModule],
})
export class AppModule {}
