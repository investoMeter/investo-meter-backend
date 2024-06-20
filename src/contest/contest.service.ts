import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginatedList } from 'src/common';
import { PrismaService } from 'src/prisma';
import { ContestRow } from './models/ContestRow';
import { ContestDetailsDialog } from './models';
import { Admin, Player } from '@prisma/client';
import { JoinContestDto } from './dto';
import { CreateContestDto } from './dto/createContest.dto';
import { ContestResponseDto } from './dto/contestResponse.dto';
import { EditContestDto } from './dto/editContest.dto';
import { EditContestStocksDto } from './dto/editContestStocks.dto';

@Injectable()
export class ContestService {
  constructor(private prisma: PrismaService) {}

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
        createdAt: 'desc',
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
        room._count.memberships < contestDetails.maxRoomCapacity;
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
      throw new BadRequestException('Player already joined contest');
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
      throw new BadRequestException('Contest has already ended');
    }

    if (contest.startDate < new Date()) {
      throw new BadRequestException('Contest has already started');
    }

    const room = contest.rooms[0];
    if (!!!room) {
      throw new BadRequestException("Room doesn't exist");
    }

    if (room._count.memberships >= contest.maxRoomCapacity) {
      throw new BadRequestException('Room is full');
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

  async createContest(admin: Admin, createContestDto: CreateContestDto) {
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
      include: {
        rooms: {
          include: {
            stocksHistories: {
              select: {
                stockId: true,
                currentShares: true,
                ContestStockPrice: true,
              },
            },
          },
        },
      },
    });

    await this.prisma.contestContestStock.createMany({
      data: stocksIds.map((id) => ({
        contestId: newContest.id,
        contestStockId: id,
      })),
    });

    await this.prisma.room.createMany({
      data: Array.from({ length: numberOfRooms }, (_, i) => ({
        roomNumber: i + 1,
        stocksHistories: {
          create: stocksIds.map((id) => ({
            stockId: id,
            contestId: newContest.id,
            currentShares: stocksShares,
          })),
        },
        contestId: newContest.id,
      })),
    });

    const contestResponseDto: ContestResponseDto = {
      id: newContest.id,
      name: newContest.name,
      maxRoomCapacity: newContest.maxRoomCapacity,
      startingMoney: newContest.startingMoney,
      startDate: new Date(newContest.startDate),
      endDate: new Date(newContest.endDate),
      startingShares: newContest.startingShares,
      rooms: newContest.rooms,
    };

    return contestResponseDto;
  }

  async getRunningContests() {
    const now = new Date();
    now.setUTCHours(now.getUTCHours() + 3);
    return await this.prisma.contest.findMany({
      orderBy: {
        startDate: 'asc',
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

  async editContest(admin: Admin, requestDto: EditContestDto): Promise<any> {
    const contest = await this.prisma.contest.findUnique({
      where: { id:requestDto.id},
    });
    if (!contest) {
      throw new BadRequestException('Contest not found');
    }
    await this.prisma.contest.update({
      where: { id:requestDto.id},
      data: {
        name: requestDto.name,
        maxRoomCapacity: requestDto.maxRoomCapacity,
        startingMoney: requestDto.startingMoney,
        startingShares: requestDto.startingShares,
        startDate: requestDto.startDate,
        endDate: requestDto.endDate,
      },
    });
  }

  async addStocks(admin: Admin, requestDto: EditContestStocksDto){
    const contest = await this.prisma.contest.findUnique({
      where: { id:requestDto.id},
    });
    if (!contest) {
      throw new BadRequestException('Contest not found');
    }
    const existingStocks = await this.prisma.contestContestStock.findMany({
      where: { contestId: requestDto.id },
      select: { contestStockId: true },
    });

    const existingStockIds = new Set(existingStocks.map(stock => stock.contestStockId));
    const newStockIds = requestDto.stockIds.filter(stockId => !existingStockIds.has(stockId));

    if (newStockIds.length === 0) {
      throw new BadRequestException('All provided stock IDs are already associated with the contest');
    }

    await this.prisma.contestContestStock.createMany({
      data: newStockIds.map(stockId => ({
        contestId: requestDto.id,
        contestStockId: stockId,
      })),
    });

    return { message: 'Stocks added successfully', addedStockIds: newStockIds };

  }

  async removeStocks(admin: Admin, requestDto: EditContestStocksDto){
    const contest = await this.prisma.contest.findUnique({
      where: { id:requestDto.id},
    });
    if (!contest) {
      throw new BadRequestException('Contest not found');
    }
    const existingStocks = await this.prisma.contestContestStock.findMany({
      where: { contestId: requestDto.id },
      select: { contestStockId: true },
    });

    const existingStockIds = new Set(existingStocks.map(stock => stock.contestStockId));
    const stocksToRemove = requestDto.stockIds.filter(stockId => existingStockIds.has(stockId));

    if (stocksToRemove.length === 0) {
      throw new BadRequestException('None of the provided stock IDs are associated with the contest');
    }

    await this.prisma.contestContestStock.deleteMany({
      where: {
        contestId: requestDto.id,
        contestStockId: {
          in: stocksToRemove,
        },
      },
    });

    return { message: 'Stocks removed successfully', removedStockIds: stocksToRemove };
  }

  async getEditableContestData(admin: Admin, contestId: string){
    const contest = await this.prisma.contest.findUnique({
      where: { id: parseInt(contestId) },
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
          contestStock: true,
          }
        }
      },
    });

    if (!contest) {
      throw new BadRequestException('Contest not found');
    }

    return contest;
  }
}
