import { Injectable, NotFoundException } from "@nestjs/common";
import { Player } from "@prisma/client";
import { PrismaService } from "src/prisma";
import { PrevContestDto } from "./dto/prevContest.dto";
import { playerDataDto } from "./dto/playerData.dto";
import { UpcomingContestDto } from "./dto/upcomingContest.dto";

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) { }

  async getPreviousContests(player: Player): Promise<PrevContestDto[]> {
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
            endDate: "desc",
          },
        },
      },
      take: 5,
      select: {
        room: {
          select: {
            roomNumber: true,
            contest: {
              select: {
                id: true,
                name: true,
                startDate: true,
                isPrivate: true,
                community: {
                  select: {name:true},
                },
              },
            },
          },
        },
      },
    });
    const mappedContests: PrevContestDto[] = contestHistories.map(
      (history) => ({
        contestId: history.room.contest.id,
        roomNumber: history.room.roomNumber,
        name: history.room.contest.name,
        date: history.room.contest.startDate,
        isPrivate: history.room.contest.isPrivate,
        communityName: history.room.contest.community?.name||"",
      }),
    );
    return mappedContests;
  }

  async getUpcomingContests(player: Player): Promise<UpcomingContestDto[]> {
    const contestMemberships = await this.prisma.contestMembership.findMany({
      where: { playerId: player.userId },
      select: { contestId: true },
    });

    const contestIds = contestMemberships.map(membership => membership.contestId);

    const contests = await this.prisma.contest.findMany({
      where: {
        id: {
          in: contestIds,
        },
        startDate: { gt: new Date() },
      },
      orderBy: { startDate: "asc" },
      take: 5,
      select: {
        id: true,
        name: true,
        startDate: true,
        isPrivate: true,
        community: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          }
        }
      },
    });

    const mappedContests: UpcomingContestDto[] = contests.map(
      (contest) => ({
        contestId: contest.id,
        name: contest.name,
        date: contest.startDate,
        isPrivate: contest.isPrivate,
        communityId: contest.community?.id || null,
        communityName: contest.community?.name || "",
        isOwner: contest.community?.ownerId == player.userId,
      }),
    );
    return mappedContests;
  }

  async getPlayerInfo(player: Player): Promise<playerDataDto> {
    const playersInfo = await this.prisma.player.findUnique({
      where: { userId: player.userId },
      select: {
        userId: true,
        coins: true,
        user: {
          select: {
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });
    if (!playersInfo) {
      throw new NotFoundException(
        "The player you are seeking with ID " +
        player.userId +
        " does not exist.",
      );
    }
    const latestLevelMembership = await this.prisma.levelMembership.findFirst({
      where: {
        playerId: player.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        levelId: true,
        updatedAt: true,
      },
    });

    if (!latestLevelMembership) {
      throw new NotFoundException(
        "The player you are seeking with ID " +
        player.userId +
        " does not exist.",
      );
    }
    const levelNum = await this.prisma.level.findUnique({
      where: { id: latestLevelMembership.levelId },
      select: { number: true },
    });
    if (!levelNum) {
      throw new NotFoundException(
        "The level you are seeking with ID " +
        latestLevelMembership.levelId +
        " does not exist.",
      );
    }
    const playerData: playerDataDto = {
      id: playersInfo.userId,
      coins: playersInfo.coins,
      name: playersInfo.user.name,
      userName: playersInfo.user.username,
      email: playersInfo.user.email,
      levelNum: levelNum.number,
    };
    return playerData;
  }
}
