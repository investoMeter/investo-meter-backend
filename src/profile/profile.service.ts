import { Injectable } from '@nestjs/common';
import { Player } from '@prisma/client';
import { PrismaService } from 'src/prisma';
import { ContestDataDto } from './dto/contestData.dto';
import { playerDataDto } from './dto/playerData.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getContestsHistory(player: Player): Promise<ContestDataDto[]> {
    const contestHistories = await this.prisma.contestMembership.findMany({
      where: {
        playerId: player.userId,
        room: {
          contest: {
            endDate: {
              lt: new Date(),
            },
          },
        },
      },
      orderBy: {
        room: {
          contest: {
            endDate: 'desc',
          },
        },
      },
      take: 5,
      include: {
        room: {
          include: {
            contest: true,
          },
        },
      },
    });
    const mappedContests: ContestDataDto[] = contestHistories.map(
      (history) => ({
        name: history.room.contest.name,
        date: history.room.contest.endDate,
      }),
    );
    return mappedContests;
  }
  async getUpcomingContests(player: Player): Promise<ContestDataDto[]> {
    const upcomingContests = await this.prisma.contestMembership.findMany({
      where: {
        playerId: player.userId,
        room: {
          contest: {
            startDate: {
              gt: new Date(),
            },
          },
        },
      },
      orderBy: {
        room: {
          contest: {
            endDate: 'desc',
          },
        },
      },
      take: 5,
      include: {
        room: {
          include: {
            contest: true,
          },
        },
      },
    });
    const mappedContests: ContestDataDto[] = upcomingContests.map(
      (upcoming) => ({
        name: upcoming.room.contest.name,
        date: upcoming.room.contest.endDate,
      }),
    );
    return mappedContests;
  }
  async getPlayerInfo(player: Player): Promise<playerDataDto> {
    const playerData: playerDataDto = {
      id: player.userId,
      Budget: player.coinsCount,
    };
    return playerData;
  }
}
