import { Player, RequestStatus } from "@prisma/client";
import { TradeRequestDto } from "./dto/trades dto/trade-request.dto";
import { PrismaService } from "src/prisma";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class TradeService {

    constructor(private prisma: PrismaService) { }

    async createBuyRequest(player: Player, requestDto: TradeRequestDto) {

        const { contestId, roomId, stockId, timestamp, quantity, price } = requestDto

        const contest = await this.prisma.contest.findFirst({
            where: {
                id: contestId,
                rooms: {
                    some: {
                        id: roomId,
                        contestId: contestId,
                    },
                },
            },
            select: {
                id: true,
                startDate: true,
                endDate: true,
                contestStocks: {
                    where: {
                        id: stockId
                    }
                },
                rooms: {
                    where: {
                        id: roomId,
                    },
                    select: {
                        id: true,
                        roomNumber: true,
                        stocksHistories: {
                            where: {
                                contestStockId: stockId
                            },
                            select: {
                                currentShares: true,
                                ContestStockPrice: true,
                            }
                        },
                        memberships: {
                            where: {
                                playerId: player.userId
                            },
                            select: {
                                currentMoneyAmount: true,
                                playerId: true,
                            }
                        }
                    },
                },
            },
        });


        // validations
        if (!contest) {
            throw new BadRequestException('Contest is not found');
        }

        const room = contest.rooms[0]
        const stock = contest.contestStocks[0]
        const membership = room.memberships[0]

        if (!room) {
            throw new NotFoundException('Room is not found');
        }

        if (!membership) {
            throw new BadRequestException("Player is not a member in this room")
        }

        if (!stock) {
            throw new NotFoundException('Stock is not found');
        }

        const timestampDate = new Date(timestamp);
        timestampDate.setUTCHours(timestampDate.getUTCHours() + 2);
        const contestStartDate = new Date(contest.startDate);
        const contestEndDate = new Date(contest.endDate);

        if (!(timestampDate >= contestStartDate && timestampDate <= contestEndDate)) {
            throw new BadRequestException("Request time is invalid")
        }

        // if all validations passed 
        const stockHistory = room.stocksHistories[0]
        const currentShares = stockHistory.currentShares
        if (currentShares != 0) {
            // TODO: create a transaction and decrease the current shares, how to keep track of owned stocks during contest? 
            // if shares < quantity requested => give remaining and create a buy request with quantity = quantity - shares
            return
        } else {
            const totalCost = quantity * price;
            const currentMoney = membership.currentMoneyAmount

            if (currentMoney < totalCost) {
                throw new BadRequestException("No Sufficient coins")
            }

            // TODO: update the coins in the membership 
            // create the buy request (done)
            const buyRequest = await this.prisma.buyRequest.create({
                data: {
                    quantity,
                    Price: price,
                    timestamp: timestampDate,
                    status: RequestStatus.PENDING,
                    player: {
                        connect: {
                            userId: player.userId,
                        },
                    },
                    stock: {
                        connect: {
                            id: stock.id,
                        }
                    },
                    room: {
                        connect: {
                            contestId, id: roomId
                        }
                    },
                    Contest: {
                        connect: {
                            id: contestId
                        }
                    }
                }
            })
            console.log(buyRequest)
            return buyRequest;
        }

    }
}