import { Injectable } from '@nestjs/common';
import { PaginatedList } from 'src/common';
import { PrismaService } from 'src/prisma';
import { ContestRow } from './models/ContestRow';
import { ContestDetailsDialog } from './models';
import { Admin, Player } from '@prisma/client';
import { JoinContestDto } from './dto';
import { CreateContestDto } from './dto/createContest.dto';
import { ContestResponseDto } from './dto/contestResponse.dto';

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
        (contestDetails.startDate.getTime() -
          contestDetails.endDate.getTime()) /
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
      throw new Error('Player already joined contest');
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
      throw new Error('Contest has already ended');
    }

    if (contest.startDate < new Date()) {
      throw new Error('Contest has already started');
    }

    const room = contest.rooms[0];
    if (!!!room) {
      throw new Error("Room doesn't exist");
    }

    if (room._count.memberships >= contest.maxRoomCapacity) {
      throw new Error('Room is full');
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
        currentMoneyAmount: contest.startingMoney,
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
      contestStocks: {
        connect: stocksIds.map((id) => ({ id })),
      },
      rooms: {
        create: Array.from({ length: numberOfRooms }, (_, i) => ({
          roomNumber: i + 1,
          stocksHistories: {
            create: stocksIds.map((id) => ({
              contestStockId: id,
              currentShares: stocksShares,
            })),
          },
        })),
      },
    };

    const newContest = await this.prisma.contest.create({
      data: contestData,
      include: {
        rooms: {
          include: {
            stocksHistories: {
              select: {
                contestStockId: true,
                currentShares: true,
                ContestStockPrice: true,
              },
            },
          },
        },
      },
    });

    const contestResponseDto: ContestResponseDto = {
      id: newContest.id,
      name: newContest.name,
      maxRoomCapacity: newContest.maxRoomCapacity,
      startingMoney: newContest.startingMoney,
      startDate: newContest.startDate,
      endDate: newContest.endDate,
      startingShares: newContest.startingShares,
      rooms: newContest.rooms,
    };

    return contestResponseDto;
  }
}
