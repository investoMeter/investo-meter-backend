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
    let data: {
      quantity: number;
      price: number;
      timestamp: Date;
      stock: {
        connect: {
          contestId_contestStockId: {
            contestId: number;
            contestStockId: number;
          };
        };
      };
      buyerMembership: { connect: { id: number } };
      contest: { connect: { id: number } };
      room: {
        connect: {
          contestId_roomNumber: { contestId: number; roomNumber: number };
        };
      };
      sellerMembership?: { connect: { id: number } };
    } = {
      quantity,
      price,
      timestamp,
      stock: {
        connect: {
          contestId_contestStockId: {
            contestId: contestId,
            contestStockId: stockId,
          },
        },
      },
      buyerMembership: {
        connect: {
          id: buyerMembershipId,
        },
      },
      contest: {
        connect: {
          id: contestId,
        },
      },
      room: {
        connect: {
          contestId_roomNumber: {
            contestId,
            roomNumber,
          },
        },
      },
    };

    if (sellerMembershipId !== undefined) {
      data.sellerMembership = {
        connect: {
          id: sellerMembershipId,
        },
      };
    }

    return await this.prisma.trade.create({ data });
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
