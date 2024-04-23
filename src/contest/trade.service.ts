import { Player, RequestStatus, TradeType, ContestMembership } from '@prisma/client';
import { TradeRequestDto } from './dto/trades dto/trade-request.dto';
import { PrismaService } from 'src/prisma';
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

@Injectable()
export class TradeService {
    constructor(private prisma: PrismaService) { }

    async createBuyRequest(player: Player, requestDto: TradeRequestDto) {
        const { quantity, price } = requestDto;

        const { contest, room, membership, stock, timestampDate } =
            await this.validateRequest(player, requestDto);

        const totalCost = quantity * price;
        this.checkSufficientCoins(membership.currentMoneyAmount, totalCost);

        const stockHistory = await this.getStockHistory(stock.id, room.id, contest.id);
        const currentShares = stockHistory?.currentShares ?? 0;

        const sharesToTrade = Math.min(currentShares, quantity);

        if (currentShares != 0) {
            await this.prisma.$transaction(async (prisma) => {
                await this.updateStockHistory(stockHistory, contest.id, stock.id, room.id, sharesToTrade);
                await this.updateOwnedStock(membership.id, stock.id, sharesToTrade);
                await this.createTrade(sharesToTrade, price, timestampDate, stock.id, membership.id, TradeType.BUY);
            });
        }

        if (quantity > currentShares) {
            await this.createNewBuyRequest(quantity - sharesToTrade, price, player.userId, contest.id, room.id, stock.id, timestampDate);
        }

        await this.updateMembershipCoins(room.id, contest.id, membership, totalCost);
        return;
    }

    checkSufficientCoins(currentMoney: number, totalCost: number) {
        if (currentMoney < totalCost) {
            throw new BadRequestException('No Sufficient coins');
        }
    }

    async getStockHistory(stockId: number, roomId: number, contestId: number) {
        return await this.prisma.stockHistory.findFirst({
            where: {
                contestStockId: stockId,
                roomId,
                roomContestId: contestId,
            }, select: {
                id: true,
                currentShares: true
            }
        });
    }

    async validateRequest(player: Player, requestDto: TradeRequestDto) {
        const { contestId, roomId, stockId, timestamp } = requestDto;

        const contest = await this.validateContest(contestId);
        const room = await this.validateRoom(roomId, contestId);
        const membership = await this.validateMembership(
            player.userId,
            roomId,
            contestId,
        );
        const stock = await this.validateStock(stockId, contestId);

        const timestampDate = new Date(timestamp);
        timestampDate.setUTCHours(timestampDate.getUTCHours() + 2);
        const contestStartDate = new Date(contest.startDate);
        const contestEndDate = new Date(contest.endDate);

        if (timestampDate < contestStartDate || timestampDate > contestEndDate) {
            throw new BadRequestException('Request time is invalid');
        }

        return { contest, room, membership, stock, timestampDate };
    }

    async validateContest(contestId: number) {
        const contest = await this.prisma.contest.findFirst({
            where: { id: contestId },
        });

        if (!contest) {
            throw new NotFoundException('Contest is not found');
        }

        return contest;
    }

    async validateRoom(roomId: number, contestId: number) {
        const room = await this.prisma.room.findFirst({
            where: { id: roomId, contestId },
        });

        if (!room) {
            throw new NotFoundException('Room is not found');
        }

        return room;
    }

    async validateMembership(userId: string, roomId: number, contestId: number) {
        const membership = await this.prisma.contestMembership.findFirst({
            where: {
                playerId: userId,
                roomId,
                contestId,
            },
        });

        if (!membership) {
            throw new BadRequestException('Player is not a member in this room');
        }

        return membership;
    }

    async validateStock(stockId: number, contestId: number) {
        const stock = await this.prisma.contestStock.findFirst({
            where: {
                id: stockId, contestId,
            },
        });

        if (!stock) {
            throw new NotFoundException('Stock is not found');
        }

        return stock;
    }

    async updateStockHistory(stockHistory: any, contestId: number, stockId: number, roomId: number, quantity: number): Promise<void> {

        await this.prisma.stockHistory.update({
            where: {
                id: stockHistory.id,
                contestStockId: stockId,
                roomId,
                roomContestId: contestId,
            },
            data: {
                currentShares: stockHistory.currentShares - quantity,
            },
        });
    }

    async updateOwnedStock(membershipId: number, stockId: number, quantity: number): Promise<void> {
        const ownedStock = await this.prisma.ownedStock.findFirst({
            where: { contestMembershipId: membershipId, stockId },
        });
        if (ownedStock) {
            await this.prisma.ownedStock.update({
                where: { id: ownedStock.id },
                data: { currentShares: ownedStock.currentShares + quantity },
            });
        } else {
            await this.prisma.ownedStock.create({
                data: {
                    contestMembershipId: membershipId,
                    stockId,
                    currentShares: quantity,
                },
            });
        }
    }

    async createTrade(quantity: number, price: number, timestampDate: Date, stockId: number, membershipId: number, tradeType: TradeType): Promise<void> {
        await this.prisma.trade.create({
            data: {
                quantity,
                price,
                tradeType,
                timestamp: timestampDate,
                stock: {
                    connect: {
                        id: stockId,
                    },
                },
                member: {
                    connect: {
                        id: membershipId,
                    },
                },
            },
        });
    }

    async updateMembershipCoins(roomId: number, contestId: number, membership: ContestMembership, totalCost: number) {
        await this.prisma.contestMembership.update({
            where: {
                roomId,
                contestId,
                id: membership.id,
            },
            data: {
                currentMoneyAmount: membership.currentMoneyAmount - totalCost,
            },
        });
    }

    async createNewBuyRequest(quantity: number, price: number, playerId: string, contestId: number, roomId: number, stockId: number, timestampDate: Date) {
        return await this.prisma.buyRequest.create({
            data: {
                quantity,
                price,
                timestamp: timestampDate,
                status: RequestStatus.PENDING,
                player: {
                    connect: {
                        userId: playerId,
                    },
                },
                stock: {
                    connect: {
                        id: stockId,
                    },
                },
                contest: {
                    connect: {
                        id: contestId,
                    },
                },
                room: {
                    connect: {
                        contestId,
                        id: roomId,
                    },
                },
            },
        });

    }

}
