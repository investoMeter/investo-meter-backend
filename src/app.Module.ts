import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LevelGatewayModule } from './gateways/level-gateway/level-gateway.module';

@Module({
  imports: [PrismaModule, AuthModule, LevelGatewayModule],
})
export class AppModule {}
