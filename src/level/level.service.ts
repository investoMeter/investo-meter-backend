import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma";
import {
  GetTutorialDto,
  SubmitAnswerRequestDto,
  SubmitAnswerResponseDto,
  getQuestionDto,
} from "./dto";
import { PaginatedList } from "src/common";
import { Player, TradeType as dbTradeType } from "@prisma/client";
import { TradeType } from "src/common";
import { BasicLevelInfo } from "src/level/models";
import { EditTutorialDto } from "./dto/edit-tutorial.leveldto";

@Injectable()
export class LevelService {
  constructor(private prisma: PrismaService) {}

  async getAllLevels(
    page: number,
    take: number,
    player: Player,
  ): Promise<PaginatedList<BasicLevelInfo>> {
    const pastLevel = await this.prisma.levelMembership.findFirst({
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

    return {
      list: levels.map((level) => {
        return {
          id: level.id,
          name: `Level ${level.number}`,
          patternName: level.patternName,
          isActive:
            pastLevel && pastLevel.level
              ? pastLevel.level.number >= level.number
              : false,
        };
      }),
      isLastPage: levels.length < take || levelsCount <= page * take + take,
    };
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

    return {
      id: level.tutorial.id,
      title: level.tutorial.title,
      imageStorageId: level.tutorial.imageStorageId || undefined,
      content: level.tutorial.content,
    };
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
          where: { position: parseInt(questionPosition) },
          include: {
            levelStock: {
              include: {
                priceHistory: { orderBy: { timeStamp: "asc" } },
              },
            },
          },
        },
      },
    });

    if (!level) {
      throw new NotFoundException(`level with id: ${levelId} does not exist`);
    }

    let nextQuestion = level.questions[0];

    if (
      !nextQuestion ||
      !nextQuestion.levelStock ||
      !nextQuestion.levelStock.priceHistory.length
    ) {
      throw new NotFoundException(`Question data is missing or incomplete`);
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
        `Answers count does not match the questions count`,
      );
    }

    let correctAnswers = 0;

    // map each question id to its answer
    const questionAnswerMap = new Map(
      levelQuestions.map((q) => [q.id, q.answer]),
    );

    answers.forEach((answer) => {
      const correctAnswer = questionAnswerMap.get(answer.questionId);
      if (!correctAnswer) {
        throw new NotFoundException(
          `question with id: ${answer.questionId} does not exist`,
        );
      }
      if (correctAnswer === answer.tradeType) {
        correctAnswers++;
      }
    });

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
      const nextLevelId = parseInt(levelId) + 1;
      const existingMembership = await this.prisma.levelMembership.findFirst({
        where: {
          levelId: nextLevelId,
          playerId: player.userId,
        },
      });

      if (!existingMembership) {
        await this.prisma.levelMembership.create({
          data: {
            levelId: nextLevelId,
            playerId: player.userId,
            failuresCount: 0,
            passedAt: null,
          },
        });
      }
    }

    return {
      correctAnswers,
      wrongAnswers: levelQuestions.length - correctAnswers,
      totalQuestions: levelQuestions.length,
    };
  }

  ///////////////////////// ADMIN SIDE ////////////////////////////////////////////////////

  async getTutorialAdmin(levelId: string): Promise<GetTutorialDto> {
    const level = await this.prisma.level.findUnique({
      where: {
        id: parseInt(levelId),
      },
      include: { tutorial: { include: { content: true } } },
    });

    if (!level || !level.tutorial) {
      throw new NotFoundException(`level with id: ${levelId} does not exist`);
    }

    return {
      id: level.tutorial.id,
      title: level.tutorial.title,
      imageStorageId: level.tutorial.imageStorageId || undefined,
      content: level.tutorial.content,
    };
  }

  async editTutorial(data: EditTutorialDto) {

    const existingTutorial = await this.prisma.tutorial.findUnique({
      where: { id: data.id },
    });

    if (!existingTutorial) {
      throw new Error(`Tutorial with id ${data.id} not found`);
    }

    if (data.content && data.content.length > 0) {
      const contentPromises = data.content.map(content => {
        return this.prisma.content.upsert({
          where: { id: content.id },
          update: {
            subTitle: content.subTitle,
            description: content.description,
          },
          create: {
            subTitle: content.subTitle,
            description: content.description,
            tutorialId: data.id,
          }
        });
      });

      await Promise.all(contentPromises);
    }

    const updatedTutorial = await this.prisma.tutorial.update({
      where: { id: data.id },
      data: {
        title: data.title,
        imageStorageId: data.imageStorageId,
        published: data.published,
        levelId: data.levelId,
      },
      include: { content: true },
    });

    return updatedTutorial;
  }

  async createLevelTutorial(getTutorialDto: GetTutorialDto, levelId: number) {
    const { id, title, content, imageStorageId } = getTutorialDto;

    // Step 1: Create or find the level
    let level = await this.prisma.level.findUnique({
      where: { id: levelId },
    });

    if (!level) {
      throw new BadRequestException("Level not found");
    }

    // Step 2: Create the tutorial
    const tutorial = await this.prisma.$transaction(async (prisma) => {
      const createdTutorial = await prisma.tutorial.create({
        data: {
          id,
          title,
          imageStorageId,
          levelId,
        },
      });

      // Step 3: Create content and link to the tutorial
      const contentPromises = content.map((contentDto) => {
        prisma.content.create({
          data: {
            subTitle: contentDto.subTitle,
            description: contentDto.description,
            tutorial: {
              connect: { id: tutorial.id },
            },
          },
        });
      });

      await Promise.all(contentPromises);

      return createdTutorial;
    });

    return tutorial;
  }

  async deleteTutorialAndContent(tutorialId: number) {
    const tutorialExists = await this.prisma.tutorial.findUnique({
      where: { id: tutorialId },
    });

    if (!tutorialExists) {
      throw new BadRequestException("Tutorial not found");
    }

    const levelId = tutorialExists.levelId;

    // Start a transaction
    await this.prisma.$transaction(async (prisma) => {
      // Step 1: Delete the content related to the tutorial
      await prisma.content.deleteMany({
        where: {
          tutorialId: tutorialId,
        },
      });

      // Step 2: Delete the tutorial
      await prisma.tutorial.delete({
        where: {
          id: tutorialId,
        },
      });
    });

    return levelId;
  }

  async adminGetAllLevels(
    page: number,
    take: number,
  ): Promise<PaginatedList<BasicLevelInfo>> {
    const pastLevel = await this.prisma.level.findFirst({
      select: {number:true},
      orderBy: {number:'desc'},
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

    return {
      list: levels.map((level) => {
        return {
          id: level.id,
          name: `Level ${level.number}`,
          patternName: level.patternName,
          isActive:
            pastLevel ? pastLevel.number >= level.number: false,
        };
      }),
      isLastPage: levels.length < take || levelsCount <= page * take + take,
    };
  }
}
