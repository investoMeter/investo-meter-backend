import { Player, BuyRequest, RequestStatus, Trade } from '@prisma/client';
import { TradeRequestDto } from './dto/trades dto/trade-request.dto';
import { PrismaService } from 'src/prisma';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
          AND "roomNumber" = ${room.roomNumber}
          AND "playerId" = ${player.userId}
          AND "status" = 'PENDING'
      `;

    const totalPendingCost = pendingRequestCost[0].total_cost;
    const currentMoney = membership.currentBalance;
    if (currentMoney < requestCost + totalPendingCost) {
      throw new BadRequestException('No Sufficient coins');
    }

    const stockHistory = await this.getStockHistory(
      stock.id,
      room.roomNumber,
      contest.id,
    );
    const currentShares = stockHistory?.currentShares ?? 0;
    const sharesToTrade = Math.min(currentShares, quantity);

    let newtrades: Trade[] = [];
    const NO_SHARES = 0;

    return await this.prisma.$transaction(async (prisma) => {
      if (currentShares != NO_SHARES) {
        const trade = await this.tradingUtilityService.createTrade(
          sharesToTrade,
          price,
          timestampDate,
          stock.id,
          membership.id,
          undefined,
          contest.id,
          room.roomNumber,
        );

        await this.updateStockHistory(
          stockHistory,
          contest.id,
          stock.id,
          room.roomNumber,
          sharesToTrade,
        );

        await this.tradingUtilityService.updateOwnedStock(
          membership.id,
          stock.id,
          sharesToTrade,
        );

        newtrades.push(trade);

        await this.tradingUtilityService.updateMembershipBalance(
          room.roomNumber,
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
          roomNumber: room.roomNumber,
          stockId: stock.id,
        };

        const matchingSellRequests =
          await this.matchingService.findMatchingSellRequests(buyRequestData);

        if (matchingSellRequests == null) {
          newBuyRequest = await this.createNewBuyRequest(buyRequestData);
        } else {
          const { requestedQuantity, trades } =
            await this.matchingService.matchBuyRequest(
              buyRequestData,
              matchingSellRequests,
            );
          newtrades.push(...trades);

          // if not all shares in the request is satisfied, then create a new buy request with the remaining shares
          if (requestedQuantity > 0) {
            newBuyRequest = await this.createNewBuyRequest({
              quantity: requestedQuantity,
              price,
              userId: player.userId,
              timestamp: timestampDate,
              contestId: contest.id,
              roomNumber: room.roomNumber,
              stockId: stock.id,
            });
          }
        }
      }

      return { newBuyRequest, trades: newtrades };
    });
  }

  async createSellRequest(
    player: { userId: string; coins: number },
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
    const pendingSellShares = await this.prisma.sellRequest.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        contestId: contest.id,
        roomNumber: room.roomNumber,
        playerId: player.userId,
        stockId: stock.id,
        status: 'PENDING',
      },
    });

    const totalPendingShares = pendingSellShares._sum.quantity ?? 0;

    if (
      !ownedStock ||
      ownedStock.currentShares < quantity + totalPendingShares
    ) {
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
        roomNumber: room.roomNumber,
        stockId: stock.id,
      };

      let newSellRequest;
      let trade;
      const matchingBuyRequests =
        await this.matchingService.findMatchingBuyRequests(sellRequestData);

      if (matchingBuyRequests == null) {
        newSellRequest = await this.createNewSellRequest(sellRequestData);
      } else {
        let result = await this.matchingService.matchSellRequest(
          sellRequestData,
          matchingBuyRequests,
        );

        trade = result.trades;

        // if not all shares in the request is sold, then create a new sell request with the remaining shares

        if (result.quantityToSell != 0) {
          await this.createNewSellRequest({
            quantity: result.quantityToSell,
            price,
            userId: player.userId,
            timestamp: timestampDate,
            contestId: contest.id,
            roomNumber: room.roomNumber,
            stockId: stock.id,
          });
        }
        console.log({ result });
      }
      return { newSellRequest, trade };
    });
  }

  async getStockHistory(
    stockId: number,
    roomNumber: number,
    contestId: number,
  ) {
    return await this.prisma.stockHistory.findFirst({
      where: {
        stockId: stockId,
        roomNumber,
        contestId: contestId,
      },
      select: {
        id: true,
        currentShares: true,
      },
    });
  }

  async validateRequest(
    player: Player,
    { contestId, roomNumber, stockId, timestamp }: any,
  ) {
    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        contestStocks: {
          where: { contestStockId: stockId },
          select: { contestStock: true },
        },
        rooms: {
          where: { roomNumber: roomNumber },
          select: {
            roomNumber: true,
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
    const stock = contest.contestStocks[0].contestStock;
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
    roomNumber: number,
    quantity: number,
  ): Promise<void> {
    await this.prisma.stockHistory.update({
      where: {
        id: stockHistory.id,
        stockId: stockId,
        roomNumber,
        contestId: contestId,
      },
      data: {
        currentShares: stockHistory.currentShares - quantity,
      },
    });
  }

  async createNewBuyRequest(BuyRequestData: TradeRequest): Promise<BuyRequest> {
    const {
      quantity,
      price,
      userId,
      timestamp,
      contestId,
      roomNumber,
      stockId,
    } = BuyRequestData;

    if (!this.tradingUtilityService.validateContestRunning(contestId)) {
      throw new NotFoundException('Contest ended');
    }

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
            contestId_contestStockId: {
              contestStockId: stockId,
              contestId: contestId,
            },
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
      },
    });
  }

  async createNewSellRequest(sellRequestData: TradeRequest) {
    const {
      quantity,
      price,
      userId,
      timestamp,
      contestId,
      roomNumber,
      stockId,
    } = sellRequestData;

    if (!this.tradingUtilityService.validateContestRunning(contestId)) {
      throw new NotFoundException('Contest ended');
    }

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
            contestId_contestStockId: {
              contestStockId: stockId,
              contestId: contestId,
            },
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
      },
    });
  }

  async cancelBuyRequest(player: Player, requestDto: CancelRequestDto) {
    const { requestId, contestId, roomNumber } = requestDto;
    const data = await this.validateRequest(player, requestDto);
    const buyRequest = await this.prisma.buyRequest.findFirst({
      where: {
        id: requestId,
        contestId,
        roomNumber,
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

    await this.tradingUtilityService.updateMembershipBalance(
      roomNumber,
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
    player: { userId: string; coins: number },
    requestDto: CancelRequestDto,
  ) {
    const { requestId, contestId, roomNumber } = requestDto;

    const data = await this.validateRequest(player, requestDto);

    const sellRequest = await this.prisma.sellRequest.findFirst({
      where: {
        id: requestId,
        contestId,
        roomNumber,
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
    const stockId = sellRequest.stockId;

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

  async getOpenTrades(
    player: { userId: string; coins: number },
    contestId: number,
    roomNumber: number,
  ) {
    const membership = await this.prisma.contestMembership.findFirst({
      where: {
        playerId: player.userId,
        contestId,
        roomNumber,
      },
    });

    if (!membership) {
      throw new UnauthorizedException('Player is not a member in this room');
    }

    let buyRequests: any = await this.prisma.buyRequest.findMany({
      where: {
        contestId,
        roomNumber,
        playerId: player.userId,
        status: RequestStatus.PENDING,
      },
      include: {
        stock: {
          include: {
            contestStock: true,
          },
        },
      },
    });

    buyRequests = buyRequests.map((buyRequest: any) => ({
      quantity: buyRequest.quantity,
      price: buyRequest.price,
      stockSymbol: buyRequest.stock.contestStock.symbol,
      type: 'BUY',
    }));

    let sellRequests:any = await this.prisma.sellRequest.findMany({
      where: {
        contestId,
        roomNumber,
        playerId: player.userId,
        status: RequestStatus.PENDING,
      },
      include: {
        stock: {
          include: {
            contestStock: true,
          },
        },
      },
    });

    sellRequests = sellRequests.map((sellRequest: any) => ({
      quantity: sellRequest.quantity,
      price: sellRequest.price,
      stockSymbol: sellRequest.stock.contestStock.symbol,
      type: 'SELL',
    }));

    return [...buyRequests, ...sellRequests];
  }

  async getClosedTrades(
    player: { userId: string; coins: number },
    contestId: number,
    roomNumber: number,
  ) {
    const membership = await this.prisma.contestMembership.findFirst({
      where: {
        playerId: player.userId,
        contestId,
        roomNumber,
      },
    });

    if (!membership) {
      throw new UnauthorizedException('Player is not a member in this room');
    }

    let buyTrades = await this.prisma.trade.findMany({
      where: {
        contestId,
        roomNumber,
        buyerMembershipId: membership.id,
      },
      include: {
        stock: {
          include: {
            contestStock: true,
          },
        },
      },
    });

    const transformedBuyTrades = buyTrades.map((trade: any) => ({
      quantity: trade.quantity,
      price: trade.price,
      stockId: trade.stockId,
      stockSymbol: trade.stock.contestStock.symbol,
      type: 'BUY',
    }));

    let sellTrades = await this.prisma.trade.findMany({
      where: {
        contestId,
        roomNumber,
        sellerMembershipId: membership.id,
      },
      include: {
        stock: {
          include: {
            contestStock: true,
          },
        },
      },
    });

    const transformedSellTrades = sellTrades.map((trade: any) => ({
      quantity: trade.quantity,
      price: trade.price,
      stockId: trade.stockId,
      stockSymbol: trade.stock.contestStock.symbol,
      type: 'SELL',
    }));

    return [...transformedBuyTrades, ...transformedSellTrades];
  }
}
