import { Injectable } from '@nestjs/common';
import { ContestMembership, PrismaClient, Trade } from '@prisma/client';

@Injectable()
export class TradingUtilityService {
  constructor() {}
  async updateOwnedStock(
    membershipId: number,
    stockId: number,
    quantity: number,
    prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
  ): Promise<void> {
    const contestMembership = await prisma.contestMembership.findFirst({
      where: {
        id: membershipId,
      },
      select: {
        contestId: true,
      },
    });

    if (!contestMembership) {
      throw new Error('Membership not found');
    }
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
          contestId: contestMembership.contestId,
          currentShares: quantity,
        },
      });
    }
  }

  async createTrade(
    quantity: number,
    price: number,
    timestamp: Date,
    stockId: number,
    buyerMembershipId: number,
    sellerMembershipId: number | undefined,
    contestId: number,
    roomNumber: number,
    prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  ): Promise<Trade> {
    if (!quantity || !price || !timestamp || !stockId || !buyerMembershipId || !contestId || !roomNumber) {
      throw new Error('Missing required parameters for creating a trade.');
    }

    const tradeInput: {
      quantity: number;
      price: number;
      timestamp: Date;
      stockId: number;
      buyerMembershipId: number;
      contestId: number;
      roomNumber: number;
      sellerMembershipId?: number;
    } = {
      quantity,
      price,
      timestamp,
      stockId,
      buyerMembershipId,
      contestId,
      roomNumber,
      sellerMembershipId: sellerMembershipId !== undefined ? sellerMembershipId : undefined,
    };

    try {
      const createdTrade = await prisma.trade.create({ data: tradeInput });
      return createdTrade;
    } catch (error) {
      throw new Error('Failed to create trade.');
    }
  }

  async updateMembershipBalance(
    membership: ContestMembership,
    totalCost: number,
    prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  ) {
    await prisma.contestMembership.update({
      where: {
        id: membership.id,
      },
      data: {
        currentBalance: { increment : totalCost },
      },
    });
  }
}
