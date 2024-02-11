import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GetLevelTutorialDto,
  SubmitAnswerRequestDto,
  SubmitAnswerResponseDto,
  getQuestionDto,
} from './dto';
import { PaginatedList } from 'src/common/paginated-list.dto';
import { Player, TradeType as dbTradeType } from '@prisma/client';
import { TradeType } from 'src/common';
import { BasicLevelInfo } from '../level/models';

@Injectable()
export class LevelService {
  constructor(private prisma: PrismaService) {}

  async getAllLevels(
    page: number = 0,
    take: number = 4,
    player: Player,
  ): Promise<PaginatedList<BasicLevelInfo>> {
    const pastLevel = await this.prisma.levelMembership.findFirstOrThrow({
      where: {
        playerId: player.userId,
      },
      select: {
        level: {
          select: {
            number: true,
          },
        },
      },
      orderBy: {
        level: {
          number: `desc`,
        },
      },
    });

    const allLevels = await this.prisma.level.findMany({
      orderBy: {
        createdAt: `asc`,
      },
      skip: page * take,
      take: take,
      select: {
        id: true,
        number: true,
        patternName: true,
      },
    });

    const result: PaginatedList<BasicLevelInfo> = {
      list: allLevels.map((level) => {
        return {
          id: level.id,
          name: `Level ${level.number}`,
          patternName: level.patternName,
          isActive: pastLevel?.level.number >= level.number,
        };
      }),
      isLastPage: allLevels.length < take,
    };

    return result;
  }

  async getTutorial(
    levelId: string,
    player: Player,
  ): Promise<GetLevelTutorialDto> {
    const level = await this.prisma.level.findUnique({
      where: {
        id: parseInt(levelId),
        memberships: {
          some: {
            playerId: player.userId,
          },
        },
      },
      include: { tutorial: { include: { content: true } } },
    });

    if (!level || !level.tutorial) {
      throw new NotFoundException(`level with id: ${levelId} does not exist`);
    }

    const result: GetLevelTutorialDto = {
      levelInfo: {
        id: level.id,
        name: `Level ${level.number}`,
        patternName: level.patternName,
        isActive: true,
      },
      tutorialInfo: {
        id: level.tutorial.id,
        title: level.tutorial.title,

        published: level.tutorial.published,
        imageStorageId: level.tutorial.imageStorageId || undefined,
        content: level.tutorial.content,
      },
    };

    return result;
  }

  async getQuestion(
    levelId: string,
    questionPosition: string,
    player: Player,
  ): Promise<getQuestionDto> {
    const level = await this.prisma.level.findUnique({
      where: {
        id: parseInt(levelId),
        memberships: {
          some: {
            playerId: player.userId,
          },
        },
      },
      select: {
        id: true,
        questions: {
          where: { id: parseInt(questionPosition) },
          include: {
            levelStock: {
              include: {
                priceHistory: { orderBy: { timeStamp: 'asc' } },
              },
            },
          },
        },
      },
    });

    if (!level) {
      throw new NotFoundException(`level with id: ${levelId} does not exist`);
    }

    if (level.questions.length === 0) {
      throw new NotFoundException(`question does not exist`);
    }

    let nextQuestion = { ...level.questions[0] };

    if (
      !nextQuestion.levelStock ||
      !nextQuestion.levelStock.priceHistory ||
      nextQuestion.levelStock.priceHistory.length === 0
    ) {
      throw new NotFoundException(`question is missing its data`);
    }

    return {
      id: nextQuestion.id,
      answer:
        nextQuestion.answer == dbTradeType.BUY ? TradeType.BUY : TradeType.SELL,
      timestamp: nextQuestion.timestamp,

      levelStock: {
        id: nextQuestion.levelStock.id,
        name: nextQuestion.levelStock.name,
        symbol: nextQuestion.levelStock.symbol,

        priceHistory: nextQuestion.levelStock.priceHistory.map((price) => {
          return {
            id: price.id,
            openPrice: price.openPrice,
            closePrice: price.closePrice,
            lowestPrice: price.lowestPrice,
            highestPrice: price.highestPrice,
            volume: parseInt(String(price.volume)),
            timeStamp: price.timeStamp,
          };
        }),
      },
    };
  }
  async submitAnswer(
    levelId: string,
    player: { userId: string },
    answers: SubmitAnswerRequestDto[],
  ): Promise<SubmitAnswerResponseDto> {
    const levelQuestions = await this.prisma.levelQuestion.findMany({
      where: {
        levelId: parseInt(levelId),
      },
      select: {
        id: true,
        answer: true,
      },
    });

    let correctAnswers = 0;
    for (let question of levelQuestions) {
      const answer = answers.find((a) => a.questionId === question.id);
      if (!!answer) {
        if (question.answer === answer.tradeType) {
          correctAnswers++;
        }
      } else {
        throw new NotFoundException(
          `question with id: ${question.id} does not exist`,
        );
      }
    }
    await this.prisma.levelMembership.update({
      where: {
        levelId_playerId: {
          levelId: parseInt(levelId),
          playerId: player.userId,
        },
      },
      data: {
        failuresCount: {
          increment: correctAnswers === levelQuestions.length ? 0 : 1,
        },
        passedAt: correctAnswers === levelQuestions.length ? new Date() : null,
      },
    });

    return {
      correctAnswers,
      wrongAnswers: levelQuestions.length - correctAnswers,
      totalQuestions: levelQuestions.length,
    };
  }
}
