import { Injectable, NotFoundException } from '@nestjs/common';
import { Player } from '@prisma/client';
import { PrismaService } from 'src/prisma';
import { ContestDataDto } from './dto/contestData.dto';
import { playerDataDto } from './dto/playerData.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getPreviousContests(player: Player): Promise<ContestDataDto[]> {
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
      select: {
        room: {
          select: {
            contest: {
              select: {
                name: true,
                startDate: true,
              },
            },
          },
        },
      },
    });
    const mappedContests: ContestDataDto[] = contestHistories.map(
      (history) => ({
        name: history.room.contest.name,
        date: history.room.contest.startDate,
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
            endDate: 'asc',
          },
        },
      },
      take: 5,
      select: {
        room: {
          select: {
            contest: {
              select: {
                name: true,
                startDate: true,
              },
            },
          },
        },
      },
    });
    const mappedContests: ContestDataDto[] = upcomingContests.map(
      (upcoming) => ({
        name: upcoming.room.contest.name,
        date: upcoming.room.contest.startDate,
      }),
    );
    return mappedContests;
  }

  async getPlayerInfo(player: Player): Promise<playerDataDto> {

    const playersInfo = await this.prisma.player.findUnique(
      {where: {userId:player.userId},
      select:
      {
        userId:true,
        coins:true,
        user: {
          select: {
              name: true,
              username: true,
              email: true
          }
      }
        
      }
    })
    if (!playersInfo) {
      throw new NotFoundException(
        'The player you are seeking with ID ' + player.userId + ' does not exist.',
      );
    }
    const latestLevelMembership = await this.prisma.levelMembership.findFirst({
      where: {
          playerId: player.userId
      },
      orderBy: {
          createdAt: 'desc'
      },
      select: {
          levelId: true,
          updatedAt: true
      }
    });
    
    if (!latestLevelMembership) {
      throw new NotFoundException(
        'The player you are seeking with ID ' + player.userId + ' does not exist.',
      );
    }
    const levelNum = await this.prisma.level.findUnique({where:{id:latestLevelMembership.levelId},select:{number:true}})
    if (!levelNum) {
      throw new NotFoundException(
        'The level you are seeking with ID ' + latestLevelMembership.levelId+ ' does not exist.',
      );
    }
    const playerData: playerDataDto = {
      id: playersInfo.userId,
      coins: playersInfo.coins,
      name: playersInfo.user.name,
      userName:playersInfo.user.username,
      email:playersInfo.user.email,
      levelNum:levelNum.number

    };
    return playerData;
  }
}
