import { Injectable, NotFoundException } from "@nestjs/common";
import { Player } from "@prisma/client";
import { PrismaService } from "src/prisma";
import { PrevContestDto } from "./dto/prevContest.dto";
import { playerDataDto } from "./dto/playerData.dto";
import { UpcomingContestDto } from "./dto/upcomingContest.dto";

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getPreviousContests(player: Player): Promise<PrevContestDto[]> {
    const contestMemberships = await this.prisma.contestMembership.findMany({
      where: { playerId: player.userId },
      select: { contestId: true, roomNumber: true },
      take: 5,
    });

    const contestIds = contestMemberships.map(
      (membership) => membership.contestId,
    );
    const nowUTC3 = new Date(Date.now() + 3 * 60 * 60 * 1000);

    const contestHistories = await this.prisma.contest.findMany({
      where: {
        id: { in: contestIds },
        endDate: { lt: nowUTC3 },
        startDate: { lt: nowUTC3 },
      },
      orderBy: { endDate: "desc" },
      include: {
        community: true,
      },
    });

    const contestIdRoomMap: Record<number, number> = {};
    contestMemberships.forEach((membership) => {
      contestIdRoomMap[membership.contestId] = membership.roomNumber;
    });

    return contestHistories.map((history) => ({
      contestId: history.id,
      roomNumber: contestIdRoomMap[history.id],
      name: history.name,
      startDate: history.startDate,
      isPrivate: history.isPrivate,
      communityName: history.community?.name || "",
    }));
  }

  async getUpcomingContests(player: Player): Promise<UpcomingContestDto[]> {
    const contestMemberships = await this.prisma.contestMembership.findMany({
      where: { playerId: player.userId },
      select: { contestId: true },
      take: 5,
    });

    const contestIds = contestMemberships.map(
      (membership) => membership.contestId,
    );

    const now = new Date();
    const nowUTC3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const contests = await this.prisma.contest.findMany({
      where: {
        id: { in: contestIds },
        startDate: { gt: nowUTC3 },
      },
      orderBy: { startDate: "asc" },
      include: {
        community: true,
      },
    });

    return contests.map((contest) => ({
      contestId: contest.id,
      name: contest.name,
      startDate: contest.startDate,
      isPrivate: contest.isPrivate,
      communityId: contest.community?.id || null,
      communityName: contest.community?.name || "",
      isOwner: contest.community?.ownerId == player.userId,
    }));
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
