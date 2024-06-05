import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { HintFacade } from './hint.facade';
import { Player } from '@prisma/client';
import { GetHintRequestDto, GetHintResponseDto } from './dto';
import { Prediction, StockSummary } from './models';

@Injectable()
export class HintService {
  constructor(
    private prisma: PrismaService,
    private facade: HintFacade,
  ) {}

  async getStockPrediciton(
    model: GetHintRequestDto,
    player: Player,
  ): Promise<GetHintResponseDto> {
    if (
      (await this.prisma.player.findFirst({
        where: {
          userId: player.userId,
          contestMemberships: {
            some: {
              contestId: model.contestId,
              roomNumber: model.roomNumber,
            },
          },
        },
      })) === null
    ) {
      throw new BadRequestException('Player not in room or contest');
    }

    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const stock = await this.prisma.stockHistory.findFirstOrThrow({
      where: {
        contestStockId: model.stockId,
        roomContestId: model.contestId,
        roomNumber: model.roomNumber,
      },
      select: {
        ContestStock: true,
        ContestStockPrice: {
          where: {
            timeStamp: { gte: fiveMinutesAgo },
          },
          orderBy: { timeStamp: 'desc' },
          take: 3,
        },
      },
    });

    if (!stock || stock.ContestStockPrice.length < 3) {
      throw new BadRequestException('Not enough data to make prediction');
    }

    const facadeModel: StockSummary = {
      Close: stock.ContestStockPrice[0].close,
      Open: stock.ContestStockPrice[0].open,
      Volume: stock.ContestStockPrice[0].volume,
      Close_Price_2min_Ago: stock.ContestStockPrice[2].close,
      MA_3min:
        stock.ContestStockPrice.map((p) => p.close).reduce((a, b) => a + b, 0) /
        3,
    };

    const prediction: Prediction = await this.facade.getHint(facadeModel);

    const changeValue =
      (prediction.Close_Next_5mins - facadeModel.Close) / facadeModel.Close;

    return { hint: changeValue };
  }
}
