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
          currentShares: quantity,
        },
      });
    }
  }

  async createTrade(
    quantity: number,
    price: number,
    timestampDate: Date,
    stockId: number,
    buyerMembershipId: number,
    sellerMembershipId: number,
  ): Promise<Trade> {
    return await this.prisma.trade.create({
      data: {
        quantity,
        price,
        timestamp: timestampDate,
        stock: {
          connect: {
            id: stockId,
          },
        },
        buyerMembership: {
          connect: {
            id: buyerMembershipId,
          },
        },
          sellerMembership: {
            connect: {
              id: sellerMembershipId,
            },
        },
      },
    });
  }

  async updateMembershipCoins(
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
        currentMoneyAmount: membership.currentMoneyAmount + totalCost,
      },
    });
  }
}
