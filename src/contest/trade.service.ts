import {
  Player,
  RequestStatus,
  TradeType,
  ContestMembership,
  Trade,
  BuyRequest,
} from "@prisma/client";
import { TradeRequestDto } from "./dto/trades dto/trade-request.dto";
import { PrismaService } from "src/prisma";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CancelRequestDto } from "./dto/trades dto/cancel-request.dto";

@Injectable()
export class TradeService {
  
  private prismaModels: any;
  constructor(private prisma: PrismaService) {
    this.prismaModels = {
      contest: this.prisma.contest,
      room: this.prisma.room,
      contestMembership: this.prisma.contestMembership,
      contestStock: this.prisma.contestStock,
    };
  }

  async createBuyRequest(player: Player, requestDto: TradeRequestDto) {
    return this.prisma.$transaction(async (prisma) => {
      const { quantity, price } = requestDto;
      const { contest, room, membership, stock, timestampDate } =
        await this.validateRequest(player, requestDto);

      const totalCost = quantity * price;
      this.checkSufficientCoins(membership.currentMoneyAmount, totalCost);

      const stockHistory = await this.getStockHistory(
        stock.id,
        room.id,
        contest.id
      );
      const currentShares = stockHistory?.currentShares ?? 0;
      const sharesToTrade = Math.min(currentShares, quantity);

      let trade;
      const NO_SHARES = 0;
      if (currentShares != NO_SHARES) {
          await this.updateStockHistory(
            stockHistory,
            contest.id,
            stock.id,
            room.id,
            sharesToTrade
          );
          
          await this.updateOwnedStock(membership.id, stock.id, sharesToTrade);
          trade = await this.createTrade(
            sharesToTrade,
            price,
            timestampDate,
            stock.id,
            membership.id,
            TradeType.BUY
          );
      }

      let buyRequest;
      if (quantity > currentShares) {
        buyRequest = await this.createNewBuyRequest(
          quantity - sharesToTrade,
          price,
          player.userId,
          contest.id,
          room.id,
          stock.id,
          timestampDate
        );
      }

      await this.updateMembershipCoins(
        room.id,
        contest.id,
        membership,
        -totalCost
      );
      return { buyRequest, trade };

    });
  }

  async createSellRequest(
    player: { userId: string; coinsCount: number },
    requestDto: TradeRequestDto
  ) {
    return this.prisma.$transaction(async (prisma) => {
      const { quantity, price } = requestDto;

      const { contest, room, membership, stock, timestampDate } =
        await this.validateRequest(player, requestDto);

      // check if the player has enough shares to sell
      const ownedStock = await this.prisma.ownedStock.findFirst({
        where: { contestMembershipId: membership.id, stockId: stock.id },
      });

      if (!ownedStock || ownedStock.currentShares < quantity) {
        throw new BadRequestException(
          "Player does not have enough shares to sell"
        );
      }

      this.updateOwnedStock(membership.id, stock.id, -quantity);

      // create a new sell request
      return await this.prisma.sellRequest.create({
        data: {
          quantity,
          price,
          timestamp: timestampDate,
          status: RequestStatus.PENDING,
          player: {
            connect: {
              userId: player.userId,
            },
          },
          stock: {
            connect: {
              id: stock.id,
            },
          },
          contest: {
            connect: {
              id: contest.id,
            },
          },
          room: {
            connect: {
              contestId: contest.id,
              id: room.id,
            },
          },
        },
      });
    });
  }

  checkSufficientCoins(currentMoney: number, totalCost: number) {
    if (currentMoney < totalCost) {
      throw new BadRequestException("No Sufficient coins");
    }
  }

  async getStockHistory(stockId: number, roomId: number, contestId: number) {
    return await this.prisma.stockHistory.findFirst({
      where: {
        contestStockId: stockId,
        roomId,
        roomContestId: contestId,
      },
      select: {
        id: true,
        currentShares: true,
      },
    });
  }

  async validateRequest(
    player: Player,
    { contestId, roomId, stockId, timestamp }: any
  ) {
    const contest = await this.validateModel(
      "contest",
      { id: contestId },
      "Contest is not found"
    );
    const room = await this.validateModel(
      "room",
      { id: roomId, contestId },
      "Room is not found"
    );
    const membership = await this.validateModel(
      "contestMembership",
      { playerId: player.userId, roomId, contestId },
      "Player is not a member in this room"
    );
    const stock = await this.validateModel(
      "contestStock",
      { id: stockId, contestId },
      "Stock is not found"
    );

    const timestampDate = new Date(timestamp);
    timestampDate.setUTCHours(timestampDate.getUTCHours() + 2);
    const contestStartDate = new Date(contest.startDate);
    const contestEndDate = new Date(contest.endDate);

    if (timestampDate < contestStartDate || timestampDate > contestEndDate) {
      throw new BadRequestException("Request time is invalid");
    }

    return { contest, room, membership, stock, timestampDate };
  }

  async validateModel(modelName: any, where: any, errorMessage: string) {
    const model = this.prismaModels[modelName];

    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }
    const result = await model.findFirst({ where });
    if (!result) {
      throw new NotFoundException(errorMessage);
    }
    return result;
  }

  async updateStockHistory(
    stockHistory: any,
    contestId: number,
    stockId: number,
    roomId: number,
    quantity: number
  ): Promise<void> {
    await this.prisma.stockHistory.update({
      where: {
        id: stockHistory.id,
        contestStockId: stockId,
        roomId,
        roomContestId: contestId,
      },
      data: {
        currentShares: stockHistory.currentShares - quantity,
      },
    });
  }

  async updateOwnedStock(
    membershipId: number,
    stockId: number,
    quantity: number
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
    membershipId: number,
    tradeType: TradeType
  ): Promise<Trade> {
    return await this.prisma.trade.create({
      data: {
        quantity,
        price,
        tradeType,
        timestamp: timestampDate,
        stock: {
          connect: {
            id: stockId,
          },
        },
        member: {
          connect: {
            id: membershipId,
          },
        },
      },
    });
  }

  async updateMembershipCoins(
    roomId: number,
    contestId: number,
    membership: ContestMembership,
    totalCost: number
  ) {
    await this.prisma.contestMembership.update({
      where: {
        roomId,
        contestId,
        id: membership.id,
      },
      data: {
        currentMoneyAmount: membership.currentMoneyAmount + totalCost,
      },
    });
  }

  async createNewBuyRequest(
    quantity: number,
    price: number,
    playerId: string,
    contestId: number,
    roomId: number,
    stockId: number,
    timestampDate: Date
  ): Promise <BuyRequest>{
    return await this.prisma.buyRequest.create({
      data: {
        quantity,
        price,
        timestamp: timestampDate,
        status: RequestStatus.PENDING,
        player: {
          connect: {
            userId: playerId,
          },
        },
        stock: {
          connect: {
            id: stockId,
          },
        },
        contest: {
          connect: {
            id: contestId,
          },
        },
        room: {
          connect: {
            contestId,
            id: roomId,
          },
        },
      },
    });
  }

  async cancelBuyRequest(player: Player, requestDto: CancelRequestDto) {
    const { requestId, contestId, roomId } = requestDto;
    const data = await this.validateRequest(player, requestDto);
    const buyRequest = await this.prisma.buyRequest.findFirst({
      where: {
        id: requestId,
        contestId,
        roomId,
        player: {
          userId: player.userId,
        },
      },
    });
    if (!buyRequest) {
      throw new NotFoundException("Buy request not found");
    }
    if (buyRequest.status !== RequestStatus.PENDING) {
      throw new BadRequestException("Buy request is already processed");
    }

    const cost = buyRequest.quantity * buyRequest.price;

    await this.updateMembershipCoins(roomId, contestId, data.membership, cost);
    await this.prisma.buyRequest.delete({ where: { id: requestId } });
  }

  async cancelSellRequest(
    player: { userId: string; coinsCount: number },
    requestDto: CancelRequestDto
  ) {
    const { requestId, contestId, roomId } = requestDto;

    const data = await this.validateRequest(player, requestDto);

    const sellRequest = await this.prisma.sellRequest.findFirst({
      where: {
        id: requestId,
        contestId,
        roomId,
        player: {
          userId: player.userId,
        },
      },
    });

    if (!sellRequest) {
      throw new NotFoundException("Sell request not found");
    }
    if (sellRequest.status !== RequestStatus.PENDING) {
      throw new BadRequestException("Sell request is already processed");
    }

    const membershipId = data.membership.id;
    const quantity = sellRequest.quantity;
    const stockId = sellRequest.contestStockId;

    await this.updateOwnedStock(membershipId, stockId, quantity);
    await this.prisma.sellRequest.delete({ where: { id: requestId } });
  }
}
