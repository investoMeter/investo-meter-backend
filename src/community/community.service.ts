import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Player } from "@prisma/client";
import { PrismaService } from "src/prisma";
import { CreateCommunityRequest } from "./dto/create-community.request.dto";
import { CreateCommunityResponse } from "./dto/create-community.response.dto";
import { CommunityActionRequest } from "./dto/community-action.request.dto";
import { JoinCommunityResponse } from "./dto/join-community.response.dto";
import { CreateCommunityContestRequest } from "./dto/create-community-contest.request.dto";
import { CreateCommunityContestResponse } from "./dto/create-community-contest.response.dto";
import { AdminMemberActionRequestDTO } from "./dto/admin-member-action.request.dto";
import { EditCommunityRequestDTO } from "./dto/edit-community.request.dto";

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}
  private readonly COMMUNITY_FEES = 500;

  async createCommunity(
    player: Player,
    request: CreateCommunityRequest,
  ): Promise<CreateCommunityResponse> {
    if (player.coins < this.COMMUNITY_FEES) {
      throw new BadRequestException("Insufficient Coins to create community");
    }

    const deductCommunityPrice = this.prisma.player.update({
      data: { coins: player.coins - this.COMMUNITY_FEES },
      where: { userId: player.userId },
    });

    const createCommunity = this.prisma.community.create({
      data: { name: request.name, ownerId: player.userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    const [_, community] = await this.prisma.$transaction([
      deductCommunityPrice,
      createCommunity,
    ]);

    await this.prisma.communityMembership.create({
      data: {
        userId: player.userId,
        communityId: community.id,
        isOwner: true,
      },
    });

    return {
      communityId: community.id,
      communityName: community.name,
      createdAt: community.createdAt,
    };
  }

  async deleteCommunity(
    player: Player,
    { communityId }: CommunityActionRequest,
  ) {
    await this.checkOwner(player.userId, communityId);
    await this.prisma.community.delete({
      where: { id: communityId },
    });
  }

  async editCommunity(
    player: Player,
    { communityId, name }: EditCommunityRequestDTO,
  ) {
    await this.checkOwner(player.userId, communityId);

    return await this.prisma.community.update({
      where: { id: communityId },
      data: { name: name },
    });
  }

  async joinCommunity(
    player: Player,
    request: CommunityActionRequest,
  ): Promise<JoinCommunityResponse> {
    const community = await this.getCommunity(request.communityId);

    const isPlayerMember = community.members.some(
      (m) => m.userId === player.userId,
    );

    if (isPlayerMember) {
      throw new BadRequestException("Player already exists in the community");
    }
    this.prisma.$transaction(async (prisma) => {
      await prisma.communityMembership.create({
        data: {
          userId: player.userId,
          communityId: community.id,
          isOwner: false,
        },
      });

      const upcomingContests = await this.prisma.contest.findMany({
        where: {
          communityId: community.id,
          startDate: { gt: new Date() },
        },
        select: {
          id: true,
          maxRoomCapacity: true,
          startingMoney: true,
          rooms: {
            select: {
              roomNumber: true,
              currentCapacity: true,
            },
          },
        },
      });

      upcomingContests.forEach(async (contest) => {
        await this.prisma.contestMembership.create({
          data: {
            contestId: contest.id,
            playerId: player.userId,
            roomNumber: contest.rooms[0].roomNumber,
            currentBalance: contest.startingMoney,
          },
        });
      });

      await this.prisma.contest.updateMany({
        where: {
          communityId: community.id,
          id: { in: upcomingContests.map((c) => c.id) },
        },
        data: {
          maxRoomCapacity: { increment: 1 },
        },
      });

      await this.prisma.room.updateMany({
        where: {
          contestId: { in: upcomingContests.map((c) => c.id) },
          roomNumber: 1,
        },
        data: {
          currentCapacity: { increment: 1 },
        },
      });
    });

    return { communityId: community.id };
  }

  async createCommunityContest(
    player: Player,
    request: CreateCommunityContestRequest,
  ): Promise<CreateCommunityContestResponse> {
    const {
      name,
      startingMoney,
      startDate,
      endDate,
      stocksShares,
      stocksIds,
      communityId,
      joinContest,
    } = request;

    await this.checkOwner(player.userId, communityId);
    const community = await this.getCommunity(communityId);

    const startDateObject = new Date(startDate);
    startDateObject.setUTCHours(startDateObject.getUTCHours() + 3);
    const endDateObject = new Date(endDate);
    endDateObject.setUTCHours(endDateObject.getUTCHours() + 3);

    const contestData = {
      name,
      maxRoomCapacity: community._count.members,
      startingMoney,
      startDate: startDateObject,
      endDate: endDateObject,
      creatorId: player.userId,
      startingShares: stocksShares,
      isPrivate: true,
      communityId: community.id,
    };

    const newContest = await this.prisma.contest.create({ data: contestData });

    const contestStocks = await this.prisma.contestStock.findMany({
      where: { id: { in: stocksIds } },
      select: { initialPrice: true, id: true },
    });

    await this.prisma.contestContestStock.createMany({
      data: contestStocks.map((stock) => ({
        contestId: newContest.id,
        contestStockId: stock.id,
      })),
    });

    let room = await this.prisma.room.create({
      data: {
        roomNumber: 1,
        contestId: newContest.id,
      },
    });

    for (const stock of contestStocks) {
      await this.prisma.stockHistory.create({
        data: {
          contestId: newContest.id,
          roomNumber: room.roomNumber,
          stockId: stock.id,
          ContestStockPrice: {
            create: stock.initialPrice,
          },
          currentShares: stocksShares,
        },
      });
    }

    let communityMembersIds;
    if (!joinContest) {
      communityMembersIds = await this.prisma.communityMembership.findMany({
        where: {
          communityId: communityId,
          userId: { not: community.ownerId },
        },
        select: { userId: true },
      });
    } else {
      communityMembersIds = await this.prisma.communityMembership.findMany({
        where: { communityId: communityId },
        select: {
          userId: true,
        },
      });
    }

    const contestMembershipData = communityMembersIds.map((member: any) => ({
      contestId: newContest.id,
      playerId: member.userId,
      roomNumber: room.roomNumber,
    }));

    await this.prisma.contestMembership.createMany({
      data: contestMembershipData,
    });

    return {
      id: newContest.id,
      name: newContest.name,
      maxRoomCapacity: newContest.maxRoomCapacity,
      startingMoney: newContest.startingMoney,
      startDate: new Date(newContest.startDate),
      endDate: new Date(newContest.endDate),
      startingShares: newContest.startingShares,

      rooms: [
        {
          roomNumber: room.roomNumber,
          currentCapacity: 0,
        },
      ],
    };
  }

  async getOwnedCommunities(player: { userId: string }) {
    return await this.prisma.$queryRaw`
    SELECT c.id, c.name, Count(cm."userId")::text AS memberCount
    FROM "Community" c
    LEFT JOIN "CommunityMembership" cm on c.id = cm."communityId"
    WHERE c."ownerId" = ${player.userId}
    GROUP BY c.id, c.name
    `;
  }

  async getJoinedCommunities(player: { userId: string; coins: number }) {
    return await this.prisma.$queryRaw`
    SELECT c.id, c.name, COUNT(cm."userId")::text AS memberCount
    FROM "Community" c
    LEFT JOIN "CommunityMembership" cm ON c.id = cm."communityId"
    WHERE c."ownerId" != ${player.userId} AND c.id in 
    (SELECT "communityId" FROM "CommunityMembership" WHERE "userId" = ${player.userId})
    GROUP BY c.id, c.name`;
  }

  async getCommunitiesToJoin(player: { userId: string; coins: number }) {
    return await this.prisma.$queryRaw`
    SELECT c.id, c.name, COUNT(cm."userId")::text AS memberCount
    FROM "Community" c
    LEFT JOIN "CommunityMembership" cm ON c.id = cm."communityId"
    WHERE c."ownerId" != ${player.userId} AND c.id not in 
    (SELECT "communityId" FROM "CommunityMembership" WHERE "userId" = ${player.userId})
    GROUP BY c.id, c.name
  `;
  }

  async leaveCommunity(
    player: { userId: string },
    { communityId }: CommunityActionRequest,
  ) {
    if (!(await this.isInCommunity(player.userId, communityId))) {
      throw new BadRequestException("Player is not a member of the community");
    }

    await this.prisma.communityMembership.delete({
      where: {
        userId_communityId: {
          userId: player.userId,
          communityId: communityId,
        },
      },
    });

    return { communityId };
  }

  async getCommunityMembers(player: { userId: string }, communityId: string) {
    if (!(await this.isInCommunity(player.userId, communityId))) {
      throw new BadRequestException("Player is not a member of the community");
    }

    const communityMembers: {
      username: string;
      userId: string;
      isOwner: boolean;
    }[] = await this.prisma.$queryRaw`
      SELECT u.username, u."id" as "userId", c."isOwner"
      FROM "Community" c
      JOIN "CommunityMembership" cm ON c.id = cm."communityId"
      Join "User" u ON cm."userId" = u."id"
      WHERE c.id = ${communityId}
    `;

    return communityMembers;
  }

  async addCommunityMember(
    owner: { userId: string },
    { communityId, memberId }: AdminMemberActionRequestDTO,
  ) {
    await this.checkOwner(owner.userId, communityId);

    if (await this.isInCommunity(memberId, communityId)) {
      throw new BadRequestException("Member is already in the community");
    }

    await this.prisma.communityMembership.create({
      data: {
        userId: memberId,
        communityId: communityId,
      },
    });

    return { communityId, memberId };
  }

  async removeCommunityMember(
    owner: { userId: string },
    { communityId, memberId }: AdminMemberActionRequestDTO,
  ) {
    await this.checkOwner(owner.userId, communityId);

    if (!(await this.isInCommunity(memberId, communityId))) {
      throw new BadRequestException("Member is not in the community");
    }

    await this.prisma.communityMembership.delete({
      where: {
        userId_communityId: {
          userId: memberId,
          communityId: communityId,
        },
      },
    });

    return { communityId, memberId };
  }

  private async isInCommunity(
    playerId: string,
    communityId: string,
  ): Promise<boolean> {
    const membership = await this.prisma.communityMembership.findFirst({
      where: { communityId: communityId, userId: playerId },
    });

    return !!membership;
  }

  private async getCommunity(communityId: string) {
    const community = await this.prisma.community.findFirst({
      where: { id: communityId },
      include: {
        members: true,
        _count: {
          select: { members: true },
        },
      },
    });
    if (!community) throw new NotFoundException("Community not found");
    return community;
  }

  private async checkOwner(playerId: string, communityId: string) {
    const community = await this.getCommunity(communityId);
    if (community.ownerId !== playerId) {
      throw new BadRequestException("Only the owner can perform this action");
    }
  }
}
