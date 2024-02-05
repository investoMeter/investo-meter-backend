import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LevelService } from './level.service';
import { AtGuard } from 'src/auth/guards';
import { GetLevelTutorialDto, getQuestionDto } from './dto';
import { PaginatedList } from 'src/common';
import { BasicLevelInfo } from './models';
import { AuthService } from 'src/auth/auth.service';
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
    @Req() req: Request,
  ): Promise<PaginatedList<BasicLevelInfo>> {
    var player = await this.authService.playerResolver((req as any)['sub']);
    return this.levelService.getAllLevels(page, take, player);
  }

  @Get(':levelId/tutorial')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getTutorial(
    @Param('levelId') levelId: string,
    @Req() req: Request,
  ): Promise<GetLevelTutorialDto> {
    var player = await this.authService.playerResolver((req as any)['sub']);
    return this.levelService.getTutorial(levelId, player);
  }

  @Get(':levelId/question/:questionId')
  @UseGuards(AtGuard)
  async getQuestion(
    @Param('levelId') levelId: string,
    @Param('questionId') questionId: string,
    @Req() req: Request,
  ): Promise<getQuestionDto> {
    var player = await this.authService.playerResolver((req as any)['sub']);
    return this.levelService.getQuestion(levelId, questionId, player);
  }
}
