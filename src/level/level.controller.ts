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

@Controller('level')
export class LevelController {
  constructor(
    private levelService: LevelService,
    private authService: AuthService,
  ) {}

  @Post('initialize-levels')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  async initializeLevelsModel(@Req() req: Request): Promise<void> {
    var player = await this.authService.playerResolver((req as any)['sub']);
    await this.levelService.initializeLevelsMode(player);
    return;
  }

  @Get('basic-levels-info')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
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
    @Param('questionPosition') questionId: number,
    @Req() req: Request,
  ): Promise<getQuestionDto> {
    var player = await this.authService.playerResolver((req as any)['sub']);
    return this.levelService.getQuestion(levelId, questionId, player);
  }
}
