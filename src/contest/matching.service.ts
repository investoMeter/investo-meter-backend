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
    const { contestId, roomNumber, stockId } = buyRequest;
    const sellRequests = await this.prisma.sellRequest.findMany({
      where: {
        contestId,
        roomNumber,
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
        roomNumber: buyRequest.roomNumber,
        contestId: buyRequest.contestId,
      },
    });

    if (!buyerMembership) {
      throw new NotFoundException("Buyer's membership not found");
    }

    let trades: Trade[] = [];

    for (const sellRequest of sellRequests) {
      if (requestedQuantity === 0) break;

      const sellerMembership = await this.prisma.contestMembership.findFirst({
        where: {
          playerId: sellRequest.playerId,
          roomNumber: buyRequest.roomNumber,
          contestId: buyRequest.contestId,
        },
      });

      if (!sellerMembership) {
        continue; // Skip this sell request if seller's membership is not found
      }

      const tradeQuantity = Math.min(requestedQuantity, sellRequest.quantity);
      const cost = sellRequest.price * tradeQuantity;

      const trade = await this.processTrade(
        buyRequest,
        sellRequest,
        sellRequest.price,
        buyerMembership,
        sellerMembership,
        cost,
        tradeQuantity,
      );

      trades.push(trade);

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

    return { requestedQuantity, trades };
  }

  async findMatchingBuyRequests(sellRequest: TradeRequest) {
    const { contestId, roomNumber, stockId } = sellRequest;
    const buyRequests = await this.prisma.buyRequest.findMany({
      where: {
        contestId,
        roomNumber,
        contestStockId: stockId,
        status: RequestStatus.PENDING,
        price: { gte: sellRequest.price },
        playerId: { not: sellRequest.userId },
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
        roomNumber: sellRequest.roomNumber,
        contestId: sellRequest.contestId,
      },
    });

    if (!sellerMembership) {
      throw new NotFoundException("Seller's membership not found");
    }

    let trades: Trade[] = [];

    for (const buyRequest of buyRequests) {
      if (quantityToSell === 0) break;

      const buyerMembership = await this.prisma.contestMembership.findFirst({
        where: {
          playerId: buyRequest.playerId,
          roomNumber: buyRequest.roomNumber,
          contestId: buyRequest.contestId,
        },
      });

      if (!buyerMembership) {
        continue; // Skip this buy request if buyer's membership is not found
      }

      // Determine the trade quantity
      const tradeQuantity = Math.min(quantityToSell, buyRequest.quantity);

      // deduct the money from the buyer and add it to the sellers
      const cost = buyRequest.price * tradeQuantity;

      const trade = await this.processTrade(
        buyRequest,
        sellRequest,
        buyRequest.price,
        buyerMembership,
        sellerMembership,
        cost,
        tradeQuantity,
      );

      trades.push(trade);

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
    return { quantityToSell, trades };
  }

  async processTrade(
    buyRequest: any,
    sellRequest: any,
    tradePrice: number,
    buyerMembership: any,
    sellerMembership: any,
    cost: number,
    tradeQuantity: number,
  ) {
    return await this.prisma.$transaction(async (prisma) => {
      const stockId = buyRequest.stockId || buyRequest.contestStockId;
      const contestId = buyRequest.contestId;
      const roomNumber = buyRequest.roomNumber;

      await this.tradingUtilityService.updateMembershipCoins(
        roomNumber,
        contestId,
        buyerMembership,
        -cost,
      );

      await this.tradingUtilityService.updateMembershipCoins(
        roomNumber,
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
      const date = new Date();
      date.setUTCHours(date.getUTCHours() + 3);
      const trade = await this.tradingUtilityService.createTrade(
        tradeQuantity,
        tradePrice,
        date,
        stockId,
        buyerMembership.id,
        sellerMembership.id,
        contestId,
        roomNumber,
      );

      return trade;
    });
  }
}
