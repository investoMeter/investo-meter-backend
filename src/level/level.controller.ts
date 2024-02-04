import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LevelService } from './level.service';
import { AtGuard } from 'src/auth/guards';
import { BasicLevelInfo, GetLevelTutorialDto } from './dto';
import { PaginatedList } from 'src/common/paginated-list.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('level')
@ApiTags('Levels')
export class LevelController {
  constructor(private levelService: LevelService) { }

  @Get('basic-levels-info')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getAllLevels(
    @Query('page') page: number,
    @Query('take') take: number,
  ): Promise<PaginatedList<BasicLevelInfo>> {
    return this.levelService.getAllLevels(page, take);
  }

  @Get(':levelId/tutorial')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getTutorial(
    @Param('levelId') levelId: string,
  ): Promise<GetLevelTutorialDto> {
    return this.levelService.getTutorial(levelId);
  }
}
