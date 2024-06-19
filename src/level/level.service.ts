import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import {
  GetTutorialDto,
  SubmitAnswerRequestDto,
  SubmitAnswerResponseDto,
  getQuestionDto,
} from './dto';
import { PaginatedList } from 'src/common';
import { Player, TradeType as dbTradeType } from '@prisma/client';
import { TradeType } from 'src/common';
import { BasicLevelInfo } from 'src/level/models';

@Injectable()
export class LevelService {
  constructor(private prisma: PrismaService) {}

  async getAllLevels(
    page: number,
    take: number,
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

    const levels = await this.prisma.level.findMany({
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
    const levelsCount = await this.prisma.level.count();

    const result: PaginatedList<BasicLevelInfo> = {
      list: levels.map((level) => {
        return {
          id: level.id,
          name: `Level ${level.number}`,
          patternName: level.patternName,
          isActive: pastLevel?.level.number >= level.number,
        };
      }),
      isLastPage: levels.length < take || levelsCount <= page * take + take,
    };

    return result;
  }

  async getTutorial(levelId: string, player: Player): Promise<GetTutorialDto> {
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

    const result: GetTutorialDto = {
      id: level.tutorial.id,
      title: level.tutorial.title,
      imageStorageId: level.tutorial.imageStorageId || undefined,
      content: level.tutorial.content,
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
      !!!nextQuestion.levelStock ||
      !!!nextQuestion.levelStock.priceHistory ||
      !!!nextQuestion.levelStock.priceHistory.length
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
            openPrice: price.open,
            closePrice: price.close,
            lowestPrice: price.lowest,
            highestPrice: price.highest,
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

    if (levelQuestions.length !== answers.length) {
      throw new BadRequestException(
        `answers count does not match the questions count`,
      );
    }

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
    const win = correctAnswers === levelQuestions.length;
    await this.prisma.levelMembership.update({
      where: {
        levelId_playerId: {
          levelId: parseInt(levelId),
          playerId: player.userId,
        },
      },
      data: {
        failuresCount: {
          increment: win ? 0 : 1,
        },
        passedAt: win ? new Date() : null,
      },
    });

    const levelsCount = await this.prisma.level.count();

    if (win && parseInt(levelId) < levelsCount) {
      await this.prisma.levelMembership.create({
        data: {
          levelId: parseInt(levelId) + 1,
          playerId: player.userId,
          failuresCount: 0,
          passedAt: null,
        },
      });
    }

    return {
      correctAnswers,
      wrongAnswers: levelQuestions.length - correctAnswers,
      totalQuestions: levelQuestions.length,
    };
  }

  ///////////////////////admin side//////////////////////////////////////////////////////////

  async editTutorial(getTutorialDto:GetTutorialDto): Promise<GetTutorialDto>
  {

    for (const contentItem of getTutorialDto.content) {
      await this.prisma.content.update({
       where: { id: contentItem.id },
       data: {
         subTitle: contentItem.subTitle,
         description: contentItem.description,
       },
     });
   }
    const tutorial=await this.prisma.tutorial.update({
      where: {
        id:getTutorialDto.id
      },
      select:{
      id: true,
      title:true,
      imageStorageId: true,
      content:true

      },
      data: {
        title:getTutorialDto.title,
      

      },
    });

    if (!tutorial) {
      throw new NotFoundException(`tutorial with id: ${getTutorialDto.id} does not exist`);
    }


    
    const result: GetTutorialDto = {
      id: tutorial.id,
      title: tutorial.title,
      imageStorageId: tutorial.imageStorageId || undefined,
      content: tutorial.content,
    };

    return result;


  }

}
