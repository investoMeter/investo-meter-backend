import { Injectable } from '@nestjs/common';
// import { Cron, CronExpression } from "@nestjs/schedule";
import { ContestService } from './contest.service';
import { PrismaService } from 'src/prisma';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StocksService {
  constructor(
    private contestService: ContestService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async updateStockPrice() {
    const runningContests = await this.contestService.getRunningContests();

    for (const contest of runningContests) {
      for (const room of contest.rooms) {
        for (const stockHistory of room.stocksHistories) {
          const stockId = stockHistory.contestStockId;

          const oneMinuteAgo = new Date();
          oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
          oneMinuteAgo.setUTCHours(oneMinuteAgo.getUTCHours() + 3);

          const stockTrades = await this.prisma.trade.findMany({
            where: {
              stockId,
              roomNumber: room.roomNumber,
              contestId: contest.id,
              timestamp: {
                gte: oneMinuteAgo,
              },
            },
            orderBy: {
              timestamp: 'asc',
            },
          });

          if (stockTrades.length !== 0) {
            // open price is the first trade price of the minute
            const open = stockTrades[0].price;
            // close price is the last trade price of the minute
            const close = stockTrades[stockTrades.length - 1].price;
            // high price is the highest trade price of the minute
            const high = Math.max(...stockTrades.map((trade) => trade.price));
            // low price is the lowest trade price of the minute
            const low = Math.min(...stockTrades.map((trade) => trade.price));
            // volume is the sum of all trade volumes of the minute
            const volume = stockTrades.reduce(
              (acc, trade) => acc + trade.quantity,
              0,
            );

            // update stock history list of prices
            await this.prisma.stockHistory.update({
              where: {
                id: stockHistory.id,
              },
              data: {
                ContestStockPrice: {
                  create: {
                    open,
                    close,
                    highest: high,
                    lowest: low,
                    volume,
                  },
                },
              },
            });
          }
        }
      }
    }
  }
}
