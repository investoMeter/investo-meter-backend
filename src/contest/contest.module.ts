import { Module } from '@nestjs/common';
import { ContestService } from './contest.service';
import { ContestController } from './contest.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { MatchingService } from './matching.service';
import { TradingUtilityService } from './trade.utility.service';

@Module({
  imports: [AuthModule],
  providers: [ContestService, TradeService, MatchingService, TradingUtilityService],
  controllers: [ContestController, TradeController],
})
export class ContestModule { }
