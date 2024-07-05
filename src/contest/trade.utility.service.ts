import { Injectable } from "@nestjs/common";
import { PrismaClient, Trade } from "@prisma/client";

interface TradeInput {
  quantity: number;
  price: number;
  timestamp: Date;
  stockId: number;
  buyerMembershipId: number;
  contestId: number;
  roomNumber: number;
  sellerMembershipId?: number;
}
@Injectable()
export class TradingUtilityService {
  constructor() {}
  async updateOwnedStock(
    stockUpdates: {
      membershipId: number;
      stockId: number;
      quantity: number;
    }[],
    contestId: number, 
    prisma: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >,
  ): Promise<void> {
    for (const { membershipId, stockId, quantity } of stockUpdates) {
      const ownedStock = await prisma.ownedStock.findFirst({
        where: { contestMembershipId: membershipId, stockId },
      });

      if (ownedStock) {
        const newShares = ownedStock.currentShares + quantity;

        if (newShares === 0) {
          await prisma.ownedStock.delete({
            where: { id: ownedStock.id },
          });
        } else {
          await prisma.ownedStock.update({
            where: { id: ownedStock.id },
            data: { currentShares: newShares },
          });
        }
      } else {
        await prisma.ownedStock.create({
          data: {
            contestMembershipId: membershipId,
            stockId,
            contestId,
            currentShares: quantity,
          },
        });
      }
    }
  }

  async createTrade(
    tradeInput: TradeInput,
    prisma: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >,
  ): Promise<Trade> {
    try {
      const createdTrade = await prisma.trade.create({ data: tradeInput });
      return createdTrade;
    } catch (error) {
      throw new Error("Failed to create trade.");
    }
  }

  async updateMembershipBalances(
    balancesUpdates: { membershipId: number; totalCost: number }[],
    prisma: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >,
  ) {
    for (const { membershipId, totalCost } of balancesUpdates) {
      await prisma.contestMembership.update({
        where: {
          id: membershipId,
        },
        data: {
          currentBalance: { increment: totalCost },
        },
      });
    }
  }
}
