import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Player } from "@prisma/client";
import { PrismaService } from "src/prisma";
import { CreateCommunityRequest } from "./dto/create-community.request.dto";
import { CreateCommunityResponse } from "./dto/create-community.response.dto";
import { JoinCommunityRequest } from "./dto/join-community.request.dto";
import { JoinCommunityResponse } from "./dto/join-community.response.dto";
import { CreateCommunityContestRequest } from "./dto/create-community-contest.request.dto";
import { CreateCommunityContestResponse } from "./dto/create-community-contest.response.dto";

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}
  async createCommunity(
    player: Player,
    request: CreateCommunityRequest,
  ): Promise<CreateCommunityResponse> {
    const deductCommunityPrice = this.prisma.player.update({
      data: {
        coins: player.coins - 100, // TODO: determine community price @fadia
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
    request: JoinCommunityRequest,
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

    if (
      community.members.find((m) => m.userId === player.userId) != undefined ||
      community.ownerId === player.userId
    ) {
      throw new BadRequestException("player already exist in community");
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

    const contestMembershipData = communityMembersIds.map((member) => ({
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
}
