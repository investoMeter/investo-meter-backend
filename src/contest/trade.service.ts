import { Player, TradeType, BuyRequest, RequestStatus } from '@prisma/client';
import { TradeRequestDto } from './dto/trades dto/trade-request.dto';
import { PrismaService } from 'src/prisma';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CancelRequestDto } from './dto/trades dto/cancel-request.dto';
import { MatchingService } from './matching.service';
import { TradeRequest } from './models/TradeRequest';
import { TradingUtilityService } from './trade.utility.service';

@Injectable()
export class TradeService {
  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
    private tradingUtilityService: TradingUtilityService,
  ) {}

  async createBuyRequest(player: Player, requestDto: TradeRequestDto) {

    const { quantity, price } = requestDto;
    const { contest, room, membership, stock, timestampDate } =
      await this.validateRequest(player, requestDto);

    const requestCost = quantity * price;

    const pendingRequestCost: any = await this.prisma.$queryRaw`
        SELECT Sum(quantity * price) as total_cost
        FROM "BuyRequest"
        WHERE "contestId" = ${contest.id}
          AND "roomId" = ${room.id}
          AND "playerId" = ${player.userId}
          AND "status" = 'PENDING'
      `;

    const totalPendingCost = pendingRequestCost[0].total_cost;
    const currentMoney = membership.currentMoneyAmount;
    if (currentMoney < requestCost + totalPendingCost) {
      throw new BadRequestException('No Sufficient coins');
    }

    const stockHistory = await this.getStockHistory(
      stock.id,
      room.id,
      contest.id,
    );
    const currentShares = stockHistory?.currentShares ?? 0;
    const sharesToTrade = Math.min(currentShares, quantity);

    let trade: any;
    const NO_SHARES = 0;

    return await this.prisma.$transaction(async (prisma) => {
      if (currentShares != NO_SHARES) {
        await this.updateStockHistory(
          stockHistory,
          contest.id,
          stock.id,
          room.id,
          sharesToTrade,
        );

        await this.tradingUtilityService.updateOwnedStock(
          membership.id,
          stock.id,
          sharesToTrade,
        );

        trade = await this.tradingUtilityService.createTrade(
          sharesToTrade,
          price,
          timestampDate,
          stock.id,
          membership.id,
          TradeType.BUY,
        );

        await this.tradingUtilityService.updateMembershipCoins(
          room.id,
          contest.id,
          membership,
          -(sharesToTrade * price),
        );
      }

      let buyRequestData: TradeRequest;
      let newBuyRequest;

      if (quantity > currentShares) {
        buyRequestData = {
          quantity: quantity - sharesToTrade,
          price,
          userId: player.userId,
          timestamp: timestampDate,
          contestId: contest.id,
          roomId: room.id,
          stockId: stock.id,
        };

        const matchingSellRequests =
          await this.matchingService.findMatchingSellRequests(buyRequestData);

        if (matchingSellRequests == null) {
          newBuyRequest = await this.createNewBuyRequest(buyRequestData);
        } else {
          const { requestedQuantity, buyTrades, sellTrades } =
            await this.matchingService.matchBuyRequest(
              buyRequestData,
              matchingSellRequests,
            );

          // if not all shares in the request is satisfied, then create a new buy request with the remaining shares
          if (requestedQuantity > 0) {
            newBuyRequest = await this.createNewBuyRequest({
              quantity: requestedQuantity,
              price,
              userId: player.userId,
              timestamp: timestampDate,
              contestId: contest.id,
              roomId: room.id,
              stockId: stock.id,
            });
          }

          console.log({ requestedQuantity, buyTrades, sellTrades });
        }
      }

      return { newBuyRequest, trade };
    });
  }

  async createSellRequest(
    player: { userId: string; coinsCount: number },
    requestDto: TradeRequestDto,
  ) {
    const { quantity, price } = requestDto;

    const { contest, room, membership, stock, timestampDate } =
      await this.validateRequest(player, requestDto);

    // check if the player has enough shares to sell
    const ownedStock = await this.prisma.ownedStock.findFirst({
      where: { contestMembershipId: membership.id, stockId: stock.id },
    });

    // check if the pending sell requests for this stock doesn't exceed the limit he has 
    const pendingSellShares = await this.prisma.buyRequest.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        contestId: contest.id,
        roomId: room.id,
        playerId: player.userId,
        contestStockId: stock.id,
        status: 'PENDING',
      },
    });

    const totalPendingShares = pendingSellShares._sum.quantity ?? 0;

    if (!ownedStock || ownedStock.currentShares < quantity + totalPendingShares) {
      throw new BadRequestException(
        'Player does not have enough shares to sell',
      );
    }

    return await this.prisma.$transaction(async (prisma) => {
      const sellRequestData = {
        quantity,
        price,
        userId: player.userId,
        timestamp: timestampDate,
        contestId: contest.id,
        roomId: room.id,
        stockId: stock.id,
      };

      let newSellRequest;
      let buyTrades, sellTrades;
      const matchingBuyRequests =
        await this.matchingService.findMatchingBuyRequests(sellRequestData);

      if (matchingBuyRequests == null) {
        newSellRequest = await this.createNewSellRequest(sellRequestData);
      } else {
        let result = await this.matchingService.matchSellRequest(
          sellRequestData,
          matchingBuyRequests,
        );

        buyTrades = result.buyTrades;
        sellTrades = result.sellTrades;

        // if not all shares in the request is sold, then create a new sell request with the remaining shares

        if (result.quantityToSell != 0) {
          await this.createNewSellRequest({
            quantity: result.quantityToSell,
            price,
            userId: player.userId,
            timestamp: timestampDate,
            contestId: contest.id,
            roomId: room.id,
            stockId: stock.id,
          });
        }
        console.log({ result });
      }
      return { newSellRequest, buyTrades, sellTrades };
    });
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
    { contestId, roomId, stockId, timestamp }: any,
  ) {
    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        contestStocks: {
          where: { id: stockId },
        },
        rooms: {
          where: { id: roomId },
          select: {
            id: true,
            memberships: {
              where: { playerId: player.userId },
            },
          },
        },
      },
    });

    if (!contest) {
      throw new NotFoundException('Contest not found');
    }
    const room = contest.rooms[0];
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    const stock = contest.contestStocks[0];
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    const membership = room.memberships[0];

    if (!membership) {
      throw new NotFoundException('Player is not a member in this room');
    }

    const timestampDate = new Date(timestamp);
    timestampDate.setUTCHours(timestampDate.getUTCHours() + 3);
    const contestStartDate = new Date(contest.startDate);
    const contestEndDate = new Date(contest.endDate);

    if (timestampDate < contestStartDate || timestampDate > contestEndDate) {
      throw new BadRequestException('Request time is invalid');
    }

    return { contest, room, membership, stock, timestampDate };
  }

  async updateStockHistory(
    stockHistory: any,
    contestId: number,
    stockId: number,
    roomId: number,
    quantity: number,
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

  async createNewBuyRequest(BuyRequestData: TradeRequest): Promise<BuyRequest> {
    const { quantity, price, userId, timestamp, contestId, roomId, stockId } =
      BuyRequestData;
    return await this.prisma.buyRequest.create({
      data: {
        quantity,
        price,
        timestamp,
        status: RequestStatus.PENDING,
        player: {
          connect: {
            userId: userId,
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

  async createNewSellRequest(sellRequestData: TradeRequest) {
    const { quantity, price, userId, timestamp, contestId, roomId, stockId } =
      sellRequestData;
    return await this.prisma.sellRequest.create({
      data: {
        quantity,
        price,
        timestamp,
        status: RequestStatus.PENDING,
        player: {
          connect: {
            userId: userId,
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
            contestId: contestId,
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
      throw new NotFoundException('Buy request not found');
    }
    if (buyRequest.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Buy request is already processed');
    }

    const cost = buyRequest.quantity * buyRequest.price;

    await this.tradingUtilityService.updateMembershipCoins(
      roomId,
      contestId,
      data.membership,
      cost,
    );
    return await this.prisma.buyRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.CANCELLED },
    });
  }

  async cancelSellRequest(
    player: { userId: string; coinsCount: number },
    requestDto: CancelRequestDto,
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
      throw new NotFoundException('Sell request not found');
    }
    if (sellRequest.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Sell request is already processed');
    }

    const membershipId = data.membership.id;
    const quantity = sellRequest.quantity;
    const stockId = sellRequest.contestStockId;

    await this.tradingUtilityService.updateOwnedStock(
      membershipId,
      stockId,
      quantity,
    );
    return await this.prisma.sellRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.CANCELLED },
    });
  }
}
