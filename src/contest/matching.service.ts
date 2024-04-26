import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { TradeRequest } from './models/TradeRequest';
import { RequestStatus } from './models/RequestStatus';
import { TradingUtilityService } from './trade.utility.service';
import { Trade } from '@prisma/client';

@Injectable()
export class MatchingService {
  constructor(
    private prisma: PrismaService,
    private tradingUtilityService: TradingUtilityService,
  ) {}

  async findMatchingSellRequests(buyRequest: TradeRequest) {
    const { contestId, roomId, stockId } = buyRequest;
    const sellRequests = await this.prisma.sellRequest.findMany({
      where: {
        contestId,
        roomId,
        contestStockId: stockId,
        status: RequestStatus.PENDING,
        price: { lte: buyRequest.price },
        playerId: { not: buyRequest.userId },
      },
      orderBy: [{ price: 'asc' }, { timestamp: 'asc' }],
    });

    if (sellRequests.length === 0) return null;
    return sellRequests;
  }

  async matchBuyRequest(buyRequest: TradeRequest, sellRequests: any) {
    let requestedQuantity = buyRequest.quantity;
    const buyerMembership = await this.prisma.contestMembership.findFirst({
      where: {
        playerId: buyRequest.userId,
        roomId: buyRequest.roomId,
        contestId: buyRequest.contestId,
      },
    });

    if (!buyerMembership) {
      throw new NotFoundException("Buyer's membership not found");
    }

    let buyTrades: Trade[] = [];
    let sellTrades: Trade[] = [];

    for (const sellRequest of sellRequests) {
      if (requestedQuantity === 0) break;

      const sellerMembership = await this.prisma.contestMembership.findFirst({
        where: {
          playerId: sellRequest.userId,
          roomId: buyRequest.roomId,
          contestId: buyRequest.contestId,
        },
      });

      if (!sellerMembership) {
        continue; // Skip this sell request if seller's membership is not found
      }

      const tradeQuantity = Math.min(requestedQuantity, sellRequest.quantity);
      const cost = sellRequest.price * tradeQuantity;

      const { buyTrade, sellTrade } = await this.processTrade(
        buyRequest,
        sellRequest,
        buyerMembership,
        sellerMembership,
        cost,
        tradeQuantity,
      );

      buyTrades.push(buyTrade);
      sellTrades.push(sellTrade);
      console.log(buyTrades, sellTrades);

      // Update the sell request quantity
      if (sellRequest.quantity > tradeQuantity) {
        await this.prisma.sellRequest.update({
          where: { id: sellRequest.id },
          data: { quantity: sellRequest.quantity - tradeQuantity },
        });
      }
      // if the sell request quantity is less than or equal the buy quantity, then the sell request is completed
      else {
        await this.prisma.sellRequest.update({
          where: { id: sellRequest.id },
          data: { status: RequestStatus.COMPLETED },
        });
      }

      requestedQuantity -= tradeQuantity;
    }

    return { requestedQuantity, buyTrades, sellTrades };
  }

  async findMatchingBuyRequests(sellRequest: TradeRequest) {
    const { contestId, roomId, stockId } = sellRequest;
    const buyRequests = await this.prisma.buyRequest.findMany({
      where: {
        contestId,
        roomId,
        contestStockId: stockId,
        status: RequestStatus.PENDING,
        price: { gte: sellRequest.price },
      },
      orderBy: [{ price: 'desc' }, { timestamp: 'asc' }],
    });

    if (buyRequests.length === 0) return null;
    return buyRequests;
  }

  async matchSellRequest(sellRequest: TradeRequest, buyRequests: any) {
    let quantityToSell = sellRequest.quantity;
    const sellerMembership = await this.prisma.contestMembership.findFirst({
      where: {
        playerId: sellRequest.userId,
        roomId: sellRequest.roomId,
        contestId: sellRequest.contestId,
      },
    });

    if (!sellerMembership) {
      throw new NotFoundException("Seller's membership not found");
    }

    let buyTrades: Trade[] = [];
    let sellTrades: Trade[] = [];

    for (const buyRequest of buyRequests) {
      if (quantityToSell === 0) break;

      const buyerMembership = await this.prisma.contestMembership.findFirst({
        where: {
          playerId: buyRequest.userId,
          roomId: buyRequest.roomId,
          contestId: buyRequest.contestId,
        },
      });

      if (!buyerMembership) {
        continue; // Skip this buy request if buyer's membership is not found
      }

      // Determine the trade quantity
      const tradeQuantity = Math.min(quantityToSell, sellRequest.quantity);

      // deduct the money from the buyer and add it to the sellers
      const cost = buyRequest.price * tradeQuantity;

      const { buyTrade, sellTrade } = await this.processTrade(
        buyRequest,
        sellRequest,
        buyerMembership,
        sellerMembership,
        cost,
        tradeQuantity,
      );

      buyTrades.push(buyTrade);
      sellTrades.push(sellTrade);
      console.log(buyTrades, sellTrades);

      // Update the buy request quantity
      if (buyRequest.quantity > tradeQuantity) {
        await this.prisma.buyRequest.update({
          where: { id: buyRequest.id },
          data: { quantity: buyRequest.quantity - tradeQuantity },
        });
      } else {
        await this.prisma.buyRequest.update({
          where: { id: buyRequest.id },
          data: { status: RequestStatus.COMPLETED },
        });
      }

      quantityToSell -= tradeQuantity;
    }
    return { quantityToSell, buyTrades, sellTrades };
  }

  async processTrade(
    buyRequest: any,
    sellRequest: any,
    buyerMembership: any,
    sellerMembership: any,
    cost: number,
    tradeQuantity: number,
  ) {
    return await this.prisma.$transaction(async (prisma) => {
    const stockId = buyRequest.stockId || buyRequest.contestStockId;
    const contestId = buyRequest.contestId;
    const roomId = buyRequest.roomId; 
    await this.tradingUtilityService.updateMembershipCoins(
      roomId,
      contestId,
      buyerMembership,
      -cost,
    );

    await this.tradingUtilityService.updateMembershipCoins(
      roomId,
      contestId,
      sellerMembership,
      cost,
    );

    // add the stock to the buyer and remove it from the seller
    await this.tradingUtilityService.updateOwnedStock(
      buyerMembership.id,
     stockId,
      tradeQuantity,
    );

    await this.tradingUtilityService.updateOwnedStock(
      sellerMembership.id,
      stockId,
      -tradeQuantity,
    );

    // Make the trade
    const buyTrade = await this.tradingUtilityService.createTrade(
      tradeQuantity,
      sellRequest.price,
      new Date(),
      stockId,
      buyerMembership.id,
      'BUY',
    );

    const sellTrade = await this.tradingUtilityService.createTrade(
      tradeQuantity,
      sellRequest.price,
      new Date(),
      stockId,
      sellerMembership.id,
      'SELL',
    );

    return { buyTrade, sellTrade };
  });
  }
}
