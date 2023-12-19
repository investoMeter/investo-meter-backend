import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BasicLevelInfo, GetLevelTutorialDto } from './dto';
import { PaginatedList } from 'src/common/paginated-list.dto';

@Injectable()
export class LevelService {
  constructor(private prisma: PrismaService) {}

  async getAllLevels(
    page: number,
    take: number,
  ): Promise<PaginatedList<BasicLevelInfo>> {
    const allLevels: BasicLevelInfo[] = await this.prisma.level.findMany({
      orderBy: {
        createdAt: `asc`,
      },
      skip: page * take,
      take: take,
      select: {
        id: true,
        name: true,
        patternName: true,
      },
    });

    const result: PaginatedList<BasicLevelInfo> = {
      list: allLevels,
      isLastPage: allLevels.length < take,
    };

    return result;
  }

  async getTutorial(levelId: string): Promise<GetLevelTutorialDto> {
    const level = await this.prisma.level.findUnique({
      where: {
        id: parseInt(levelId),
      },
      select: { id: true, name: true, patternName: true, tutorial: true },
    });

    if (!level || !level.tutorial) {
      throw new NotFoundException(`level with id: ${levelId} does not exist`);
    }

    const result: GetLevelTutorialDto = {
      levelInfo: {
        id: level.id,
        name: level.name,
        patternName: level.patternName,
      },
      tutorialInfo: {
        id: level.tutorial.id,
        title: level.tutorial.title,
        description: level.tutorial.description,
        published: level.tutorial.published,
        imageStorageId: level.tutorial.imageStorageId || undefined,
      },
    };

    return result;
  }
}
