import { Module } from '@nestjs/common';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import { AuthModule } from 'src/auth';

@Module({
  imports: [AuthModule],
  providers: [LevelService],
  controllers: [LevelController],
})
export class LevelModule {}
