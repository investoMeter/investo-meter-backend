import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PaginatedList } from "src/common";
import { PrismaService } from "src/prisma";
import { ContestRow } from "./models/ContestRow";
import { ContestDetailsDialog } from "./models";
import { Admin, Player } from "@prisma/client";
import { JoinContestDto } from "./dto";
import { CreateContestDto } from "./dto/createContest.dto";
import { ContestResponseDto } from "./dto/contestResponse.dto";
import { EditContestDto } from "./dto/editContest.dto";
import { EditContestStocksDto } from "./dto/editContestStocks.dto";
import { TradingUtilityService } from "./trade.utility.service";
import { ContestEditableData } from "./dto/contestEditableData.dto";

type LeaderboardEntry = {
  id: number;
  currentBalance: number;
  username: string;
  userid: string;
};

@Injectable()
export class ContestService {
  constructor(
    private prisma: PrismaService,
    private tradeUtility: TradingUtilityService,
  ) {}

  async getAllContests(
    page: number = 0,
    take: number = 8,
  ): Promise<PaginatedList<ContestRow>> {
    const contests = await this.prisma.contest.findMany({
      where: {
        startDate: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
      skip: page * take,
      take: take,
    });

    const contestsCount = await this.prisma.contest.count({
      where: {
        startDate: {
          gt: new Date(),
        },
      },
    });

    const result: PaginatedList<ContestRow> = {
      list: contests.map((contest) => {
        return {
          id: contest.id,
          name: contest.name,
          startDate: contest.startDate,
          duration:
            (contest.endDate.getTime() - contest.startDate.getTime()) /
            (1000 * 60 * 60),
        };
      }),
      isLastPage: contests.length < take || contestsCount <= page * take + take,
    };

    return result;
  }

  async getContestDetails(contestId: number): Promise<ContestDetailsDialog> {
    const contestDetails = await this.prisma.contest.findFirstOrThrow({
      where: {
        id: {
          equals: contestId,
        },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        maxRoomCapacity: true,
        rooms: {
          select: {
            roomNumber: true,
            _count: {
              select: {
                memberships: true,
              },
            },
          },
        },
        creator: {
          select: {
            name: true,
          },
        },
      },
    });

    const result: ContestDetailsDialog = {
      startDate: contestDetails.startDate,
      duration:
        (contestDetails.endDate.getTime() -
          contestDetails.startDate.getTime()) /
        (1000 * 60 * 60),
      creator: contestDetails.creator.name,
      availableRooms: contestDetails.rooms.filter((room) => {
        return room._count.memberships <= contestDetails.maxRoomCapacity;
      }),

      totalJoinedPlayers: contestDetails.rooms
        .map((room) => room._count.memberships)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0),
    };

    return result;
  }

  async joinContest(player: Player, requestDto: JoinContestDto): Promise<void> {
    if (
      await this.prisma.contestMembership.findFirst({
        where: {
          AND: {
            playerId: {
              equals: player.userId,
            },
            contestId: {
              equals: requestDto.contestId,
            },
          },
        },
      })
    ) {
      throw new BadRequestException("Player already joined contest");
    }

    const contest = await this.prisma.contest.findFirstOrThrow({
      where: {
        AND: {
          id: {
            equals: requestDto.contestId,
          },
          rooms: {
            some: {
              AND: {
                roomNumber: {
                  equals: requestDto.roomNumber,
                },
                contestId: {
                  equals: requestDto.contestId,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        maxRoomCapacity: true,
        startingMoney: true,
        rooms: {
          where: {
            roomNumber: {
              equals: requestDto.roomNumber,
            },
          },
          select: {
            roomNumber: true,
            _count: {
              select: {
                memberships: true,
              },
            },
          },
        },
      },
    });

    if (contest.endDate < new Date()) {
      throw new BadRequestException("Contest has already ended");
    }

    if (contest.startDate < new Date()) {
      throw new BadRequestException("Contest has already started");
    }

    const room = contest.rooms[0];
    if (!!!room) {
      throw new BadRequestException("Room doesn't exist");
    }

    if (room._count.memberships >= contest.maxRoomCapacity) {
      throw new BadRequestException("Room is full");
    }

    await this.prisma.contestMembership.create({
      data: {
        player: {
          connect: {
            userId: player.userId,
          },
        },
        room: {
          connect: {
            contestId_roomNumber: {
              roomNumber: requestDto.roomNumber,
              contestId: requestDto.contestId,
            },
          },
        },
        currentBalance: contest.startingMoney,
      },
    });
  }

  async createContest(
    admin: Admin,
    createContestDto: CreateContestDto,
  ): Promise<ContestResponseDto> {
    const {
      name,
      maxRoomCapacity,
      startingMoney,
      startDate,
      endDate,
      numberOfRooms,
      stocksShares,
      stocksIds,
    } = createContestDto;

    const startDateObject = new Date(startDate);
    startDateObject.setUTCHours(startDateObject.getUTCHours() + 3);

    const endDateObject = new Date(endDate);
    endDateObject.setUTCHours(endDateObject.getUTCHours() + 3);

    const contestData = {
      name,
      maxRoomCapacity,
      startingMoney,
      startDate: startDateObject,
      endDate: endDateObject,
      creatorId: admin.userId,
      startingShares: stocksShares,
    };

    const newContest = await this.prisma.contest.create({
      data: contestData,
    });
    const contestStocks = await this.prisma.contestStock.findMany({
      where: {
        id: {
          in: stocksIds,
        },
      },
      select: {
        initialPrice: true,
        id: true,
      },
    });
    await this.prisma.contestContestStock.createMany({
      data: contestStocks.map((stock) => ({
        contestId: newContest.id,
        contestStockId: stock.id,
      })),
    });

    // await this.prisma.room.createMany({
    //   data: Array.from({ length: numberOfRooms }, (_, i) => ({
    //     roomNumber: i + 1,
    //     stocksHistories: {
    //       create: stocksIds.map((id) => ({
    //         stockId: id,
    //         contestId: newContest.id,
    //         currentShares: stocksShares,
    //       })),
    //     },
    //     contestId: newContest.id,
    //   })),
    // });

    const rooms = [];
    for (let i = 1; i <= numberOfRooms; i++) {
      let room = await this.prisma.room.create({
        data: {
          roomNumber: i,
          contestId: newContest.id,
        },
      });
      rooms.push(room);
    }

    rooms.forEach(async (room) => {
      for (const stock of contestStocks) {
        await this.prisma.stockHistory.create({
          data: {
            contestId: newContest.id,
            roomNumber: room.roomNumber,
            stockId: stock.id,
            ContestStockPrice: {
              create: {
                open: stock.initialPrice.open,
                close: stock.initialPrice.close,
                highest: stock.initialPrice.highest,
                lowest: stock.initialPrice.lowest,
                volume: stock.initialPrice.volume,
                timeStamp: startDateObject,
              },
            },
            currentShares: stocksShares,
          },
        });
      }
    });

    const contestResponseDto: ContestResponseDto = {
      id: newContest.id,
      name: newContest.name,
      maxRoomCapacity: newContest.maxRoomCapacity,
      startingMoney: newContest.startingMoney,
      startDate: new Date(newContest.startDate),
      endDate: new Date(newContest.endDate),
      startingShares: newContest.startingShares,
      rooms: rooms.map((room) => ({
        roomNumber: room.roomNumber,
        currentCapacity: 0,
      })),
    };

    return contestResponseDto;
  }

  async getRunningContests() {
    const now = new Date();
    now.setUTCHours(now.getUTCHours() + 3);
    return await this.prisma.contest.findMany({
      orderBy: {
        startDate: "asc",
      },
      where: {
        AND: {
          startDate: {
            lte: new Date(now.getTime() + 60000),
          },
          endDate: {
            gte: new Date(now.getTime() + 60000),
          },
          started: true,
        },
      },
      select: {
        id: true,
        contestStocks: {
          select: { contestStock: { select: { id: true, symbol: true } } },
        },
        rooms: {
          select: {
            roomNumber: true,
            stocksHistories: {
              select: {
                id: true,
                stockId: true,
                ContestStockPrice: true,
              },
            },
          },
        },
      },
    });
  }

  async fetchContestLeaderboard(
    contestId: number,
    roomNumber: number,
    limit?: number,
  ): Promise<LeaderboardEntry[]> {
    return await this.prisma.$queryRaw`
    SELECT cm.id, cm."currentBalance", u.username, u.id as userId
    FROM "ContestMembership" cm
    JOIN "users" u ON cm."playerId" = u."id"
    WHERE cm."contestId" = ${contestId}
      AND cm."roomNumber" = ${roomNumber}
    ORDER BY cm."currentBalance" DESC, u.username ASC
  `;
  }

  async getLeaderboard(
    player: { userId: string },
    contestId: number,
    roomNumber: number,
  ) {
    const membership = await this.prisma.contestMembership.findFirst({
      select: {
        id: true,
      },
      where: {
        playerId: player.userId,
        contestId: contestId,
        roomNumber: roomNumber,
      },
    });

    if (!membership) {
      throw new UnauthorizedException();
    }

    return await this.fetchContestLeaderboard(contestId, roomNumber);
  }

  async rewardWinners(contestId: number, roomNumber: number) {
    const rewards = [1000, 500, 250]; // Coins for 1st, 2nd, and 3rd place
    const leaderboard = await this.fetchContestLeaderboard(
      contestId,
      roomNumber,
    );

    const NUMBER_OF_WINNERS = 3;

    const topThree = leaderboard.slice(0, NUMBER_OF_WINNERS);

    // Check for ties among the top 3 players
    let winners = [];
    let currentRank = 1;
    let previousScore = null;

    for (const player of topThree) {
      if (previousScore != null && player.currentBalance !== previousScore) {
        currentRank++;
      }
      winners.push({ ...player, rank: currentRank });
      previousScore = player.currentBalance;
    }

    const updateOperations = winners.map((winner) => {
      return this.prisma.player.update({
        where: { userId: winner.userid },
        data: { coins: { increment: rewards[winner.rank - 1] } },
      });
    });

    await this.prisma.$transaction(updateOperations);
  }

  async editContest(
    requestDto: EditContestDto,
  ): Promise<ContestEditableData> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: requestDto.id },
    });
    if (!contest) {
      throw new BadRequestException("Contest not found");
    }
    if (await this.tradeUtility.validateContestRunning(contest.id)) {
      throw new BadRequestException("Contest is already running");
    }
    await this.prisma.contest.update({
      where: { id: requestDto.id },
      data: {
        name: requestDto.name,
        maxRoomCapacity: requestDto.maxRoomCapacity,
        startingMoney: requestDto.startingMoney,
        startingShares: requestDto.startingShares,
        startDate: requestDto.startDate,
        endDate: requestDto.endDate,
      },
    });
    return this.mapContestToEditableData(contest.id);
  }

  async addStocks(
    requestDto: EditContestStocksDto,
  ): Promise<ContestEditableData> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: requestDto.id },
    });

    if (!contest) {
      throw new BadRequestException("Contest not found");
    }

    if (await this.tradeUtility.validateContestRunning(contest.id)) {
      throw new BadRequestException("Contest is already running");
    }

    const existingStocks = await this.prisma.contestContestStock.findMany({
      where: { contestId: requestDto.id },
      select: { contestStockId: true },
    });

    const existingStockIds = new Set(
      existingStocks.map((stock) => stock.contestStockId),
    );
    const newStockIds = requestDto.stockIds.filter(
      (stockId) => !existingStockIds.has(stockId),
    );

    if (newStockIds.length === 0) {
      throw new BadRequestException(
        "All provided stock IDs are already associated with the contest",
      );
    }

    const contestStocks = await this.prisma.contestStock.findMany({
      where: {
        id: {
          in: newStockIds,
        },
      },
      select: {
        initialPrice: true,
        id: true,
      },
    });

    await this.prisma.contestContestStock.createMany({
      data: contestStocks.map((stock) => ({
        contestId: requestDto.id,
        contestStockId: stock.id,
      })),
    });

    const rooms = await this.prisma.room.findMany({
      where: { contestId: requestDto.id },
      select: { roomNumber: true },
    });

    for (const room of rooms) {
      for (const stock of contestStocks) {
        await this.prisma.stockHistory.create({
          data: {
            contestId: contest.id,
            roomNumber: room.roomNumber,
            stockId: stock.id,
            ContestStockPrice: {
              create: {
                open: stock.initialPrice.open,
                close: stock.initialPrice.close,
                highest: stock.initialPrice.highest,
                lowest: stock.initialPrice.lowest,
                volume: stock.initialPrice.volume,
                timeStamp: contest.startDate,
              },
            },
            currentShares: contest.startingShares,
          },
        });
      }
    }

    return this.mapContestToEditableData(contest.id);
  }

  async removeStocks(
    requestDto: EditContestStocksDto,
  ): Promise<ContestEditableData> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: requestDto.id },
    });
    if (!contest) {
      throw new BadRequestException("Contest not found");
    }
    if (await this.tradeUtility.validateContestRunning(contest.id)) {
      throw new BadRequestException("Contest is already running");
    }
    const existingStocks = await this.prisma.contestContestStock.findMany({
      where: { contestId: requestDto.id },
      select: { contestStockId: true },
    });

    const existingStockIds = new Set(
      existingStocks.map((stock) => stock.contestStockId),
    );
    const stocksToRemove = requestDto.stockIds.filter((stockId) =>
      existingStockIds.has(stockId),
    );

    if (stocksToRemove.length === 0) {
      throw new BadRequestException(
        "None of the provided stock IDs are associated with the contest",
      );
    }

    const stockHistoryIds = await this.prisma.stockHistory.findMany({
      where: {
        contestId: requestDto.id,
        stockId: {
          in: stocksToRemove,
        },
      },
      select: {
        id: true,
      },
    });
    const stockHistoryIdValues = stockHistoryIds.map(
      (stockHistory) => stockHistory.id,
    );
    await this.prisma.$transaction([
      this.prisma.contestStockPrice.deleteMany({
        where: {
          stockHistoryId: {
            in: stockHistoryIdValues,
          },
        },
      }),
      this.prisma.stockHistory.deleteMany({
        where: {
          contestId: requestDto.id,
          stockId: { in: stocksToRemove },
        },
      }),
      this.prisma.contestContestStock.deleteMany({
        where: {
          contestId: requestDto.id,
          contestStockId: { in: stocksToRemove },
        },
      }),
    ]);

    return this.mapContestToEditableData(contest.id);
  }

  async getEditableContestData(
    contestId: string,
  ): Promise<ContestEditableData> {
    return this.mapContestToEditableData(parseInt(contestId));
  }

  async mapContestToEditableData(
    contestId: number,
  ): Promise<ContestEditableData> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        id: true,
        name: true,
        maxRoomCapacity: true,
        startingMoney: true,
        startingShares: true,
        startDate: true,
        endDate: true,
        contestStocks: {
          select: {
            contestStock: {
              select: {
                id: true,
                name: true,
                symbol: true,
              },
            },
          },
        },
      },
    });

    if (!contest) {
      throw new BadRequestException("Contest not found");
    }
    const transformedContest: ContestEditableData = {
      id: contest.id,
      name: contest.name,
      maxRoomCapacity: contest.maxRoomCapacity,
      startingMoney: contest.startingMoney,
      startingShares: contest.startingShares,
      startDate: contest.startDate,
      endDate: contest.endDate,
      stocks: contest.contestStocks.map((cs) => ({
        id: cs.contestStock.id,
        name: cs.contestStock.name,
        symbol: cs.contestStock.symbol,
      })),
    };

    return transformedContest;
  }
}
