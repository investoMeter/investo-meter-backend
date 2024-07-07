import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma";
import { TradeRequest } from "./models/TradeRequest";
import { RequestStatus } from "./models/RequestStatus";
import { TradingUtilityService } from "./trade.utility.service";
import { PrismaClient, Trade } from "@prisma/client";

interface ProcessTradeParams {
  request: {stockId: number, contestId:number, roomNumber: number};
  tradePrice: number;
  buyerMembership: any;
  sellerMembership: any;
  cost: number;
  tradeQuantity: number;
}

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
        stockId: stockId,
        status: RequestStatus.PENDING,
        price: { lte: buyRequest.price },
        playerId: { not: buyRequest.userId },
      },
      orderBy: [{ price: "asc" }, { timestamp: "asc" }],
    });

    if (sellRequests.length === 0) return null;
    return sellRequests;
  }

  async matchBuyRequest(buyRequest: TradeRequest, sellRequests: any,
     prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
  ) {

    let requestedQuantity = buyRequest.quantity;
    const { contestId, roomNumber, stockId } = buyRequest;

    const buyerMembership = await this.prisma.contestMembership.findFirst({
      where: {
        playerId: buyRequest.userId,
        roomNumber,
        contestId,
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
          roomNumber,
          contestId,
        },
      });

      if (!sellerMembership) {
        continue; // Skip this sell request if seller's membership is not found
      }

      const tradeQuantity = Math.min(requestedQuantity, sellRequest.quantity);
      const cost = sellRequest.price * tradeQuantity;

      const trade = await this.processTrade({
        request: {stockId, contestId, roomNumber},
        tradePrice: sellRequest.price,
        buyerMembership,
        sellerMembership,
        cost,
        tradeQuantity,
      }, 
    prisma);

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
        stockId: stockId,
        status: RequestStatus.PENDING,
        price: { gte: sellRequest.price },
        playerId: { not: sellRequest.userId },
      },
      orderBy: [{ price: "desc" }, { timestamp: "asc" }],
    });

    if (buyRequests.length === 0) return null;
    return buyRequests;
  }

  async matchSellRequest(sellRequest: TradeRequest, buyRequests: any, prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) {
    let quantityToSell = sellRequest.quantity;
    const { contestId, roomNumber, stockId } = sellRequest;

    const sellerMembership = await this.prisma.contestMembership.findFirst({
      where: {
        playerId: sellRequest.userId,
        roomNumber,
        contestId,
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
          roomNumber,
          contestId,
        },
      });

      if (!buyerMembership) {
        continue; // Skip this buy request if buyer's membership is not found
      }

      // Determine the trade quantity
      const tradeQuantity = Math.min(quantityToSell, buyRequest.quantity);

      // deduct the money from the buyer and add it to the sellers
      const cost = buyRequest.price * tradeQuantity;
      
      const trade = await this.processTrade({
        request: {stockId, contestId, roomNumber},
        tradePrice: buyRequest.price,
        buyerMembership,
        sellerMembership,
        cost,
        tradeQuantity,
      },
    prisma);

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

  async processTrade({
    request,
    tradePrice,
    buyerMembership,
    sellerMembership,
    cost,
    tradeQuantity,
  }: ProcessTradeParams,
   prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> ) {
    const stockId = request.stockId;
    const contestId = request.contestId;
    const roomNumber = request.roomNumber;

      const balances = [
        { membershipId: buyerMembership.id, totalCost: -cost },
        { membershipId: sellerMembership.id, totalCost: cost },
      ];

      await this.tradingUtilityService.updateMembershipBalances(
        balances,
        prisma,
      );

      const stockUpdates = [
        { membershipId: buyerMembership.id, stockId, quantity: tradeQuantity },
        {
          membershipId: sellerMembership.id,
          stockId,
          quantity: -tradeQuantity,
        },
      ];

      // add the stock to the buyer and remove it from the seller
      await this.tradingUtilityService.updateOwnedStock(
        stockUpdates,
        contestId,
        prisma,
      );

      // Make the trade
      const date = new Date();
      date.setUTCHours(date.getUTCHours() + 3);

      const tradeData = {
        quantity: tradeQuantity,
        price: tradePrice,
        timestamp: date,
        stockId,
        buyerMembershipId: buyerMembership.id,
        contestId,
        roomNumber,
        sellerMembershipId: sellerMembership.id,
      };

      const trade = await this.tradingUtilityService.createTrade(
        tradeData,
        prisma,
      );

      return trade;
    }
  }
