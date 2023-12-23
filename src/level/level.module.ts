import { Module } from '@nestjs/common';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';

@Module({
  providers: [LevelService],
  controllers: [LevelController]
})
export class LevelModule {}
