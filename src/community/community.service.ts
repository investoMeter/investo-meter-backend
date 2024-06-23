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
      data: {
        coins: player.coins - this.COMMUNITY_FEES, // TODO: determine community price @fadia
      },
      where: {
        userId: player.userId,
      },
    });

    const createCommunity = this.prisma.community.create({
      data: {
        name: request.name,
        ownerId: player.userId,
      },
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

    return {
      communityId: community.id,
      communityName: community.name,
      createdAt: community.createdAt,
    };
  }

  async joinCommunity(
    player: Player,
    request: CommunityActionRequest,
  ): Promise<JoinCommunityResponse> {
    const community = await this.prisma.community.findFirst({
      where: {
        id: request.communityId,
      },
      include: {
        members: true,
      },
    });

    if (community == null) {
      throw new NotFoundException("Invalid Community ID");
    }

    const isPlayerMember = community.members.some(
      (m) => m.userId === player.userId,
    );
    
    const isPlayerOwner = community.ownerId === player.userId;

    if (isPlayerMember || isPlayerOwner) {
      throw new BadRequestException("Player already exists in the community");
    }

    await this.prisma.communityMembership.create({
      data: {
        userId: player.userId,
        communityId: community.id,
      },
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

    const community = await this.prisma.community.findFirst({
      where: {
        id: communityId,
      },
      select: {
        id: true,
        ownerId: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (community === null) {
      throw new NotFoundException(
        `Invalid Community ID: ${request.communityId}`,
      );
    }

    if (community.ownerId !== player.userId) {
      throw new BadRequestException(`Only Community Owner can create contest`);
    }

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

    let communityMembersIds;
    if (!joinContest) {
      communityMembersIds = await this.prisma.communityMembership.findMany({
        where: {
          communityId: communityId,
          userId: {
            not: community.ownerId,
          },
        },
        select: {
          userId: true,
        },
      });
    } else {
      communityMembersIds = await this.prisma.communityMembership.findMany({
        where: {
          communityId: communityId,
        },
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

    await this.prisma.player.update({
      where: {
        userId: player.userId,
      },
      data: {
        coins: player.coins - 10, // TODO: Creating a community contest deducts from coins ? @fadia
      },
    });

    const response: CreateCommunityContestResponse = {
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

    return response;
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
    player: { userId: string; coins: number },
    leaveCommunityDto: { communityId: string },
  ) {
    const membership = await this.prisma.communityMembership.findFirst({
      where: {
        userId: player.userId,
        communityId: leaveCommunityDto.communityId,
      },
    });

    if (!membership) {
      throw new NotFoundException("Player is not a member of the community");
    }

    await this.prisma.communityMembership.delete({
      where: {
        userId_communityId: {
          userId: player.userId,
          communityId: leaveCommunityDto.communityId,
        },
      },
    });

    return { communityId: leaveCommunityDto.communityId };
  }

  async getCommunityMembers(player: { userId: string;  }, communityId: string){
    const communityMembers :{
      username: string,
      userId: string,
      isOwner: boolean
    }[]
     = await this.prisma.$queryRaw`
      SELECT u.username, u."id" as "userId", false AS isOwner
      FROM "Community" c
      JOIN "CommunityMembership" cm ON c.id = cm."communityId"
      Join "User" u ON cm."userId" = u."id"
      WHERE c.id = ${communityId}
      Union 
      SELECT u.username, u."id" as "userId", true AS isOwner
      FROM "Community" c
      JOIN "User" u ON c."ownerId" = u."id"
      WHERE c.id = ${communityId}
    `;

    const isMember = communityMembers.some(member => member.userId === player.userId);
    const isAdmin = communityMembers.some(member => member.userId === player.userId && member.isOwner);

    if (!isMember && !isAdmin) {
      throw new BadRequestException('Player is not a member or admin of the community');
    }

    return communityMembers
  }
}
