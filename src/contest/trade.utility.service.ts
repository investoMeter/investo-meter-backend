import { Injectable } from '@nestjs/common';
import { ContestMembership, Trade } from '@prisma/client';
import { PrismaService } from 'src/prisma';

@Injectable()
export class TradingUtilityService {
  constructor(private prisma: PrismaService) {}
  async updateOwnedStock(
    membershipId: number,
    stockId: number,
    quantity: number,
  ): Promise<void> {
    const contestMembership = await this.prisma.contestMembership.findFirst({
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
    const ownedStock = await this.prisma.ownedStock.findFirst({
      where: { contestMembershipId: membershipId, stockId },
    });

    if (ownedStock) {
      const newShares = ownedStock.currentShares + quantity;

      if (newShares === 0) {
        await this.prisma.ownedStock.delete({
          where: { id: ownedStock.id },
        });
      } else {
        await this.prisma.ownedStock.update({
          where: { id: ownedStock.id },
          data: { currentShares: newShares },
        });
      }
    } else {
      await this.prisma.ownedStock.create({
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
      const createdTrade = await this.prisma.trade.create({ data: tradeInput });
      return createdTrade;
    } catch (error) {
      throw new Error('Failed to create trade.');
    }
  }

  async updateMembershipBalance(
    roomNumber: number,
    contestId: number,
    membership: ContestMembership,
    totalCost: number,
  ) {
    await this.prisma.contestMembership.update({
      where: {
        roomNumber,
        contestId,
        id: membership.id,
      },
      data: {
        currentBalance: membership.currentBalance + totalCost,
      },
    });
  }
}
