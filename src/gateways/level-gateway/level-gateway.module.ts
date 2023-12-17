import { Module } from '@nestjs/common';
import { LevelGateway } from './level-gateway';

@Module({
  providers: [LevelGateway],
})
export class LevelGatewayModule {}
