import {
  Body,
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
import {
  GetTutorialDto,
  SubmitAnswerRequestDto,
  SubmitAnswerResponseDto,
  getQuestionDto,
} from './dto';
import { PaginatedList } from 'src/common';
import { BasicLevelInfo } from './models';
import { AuthService } from 'src/auth';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@Controller('level')
@ApiTags('Levels')
export class LevelController {
  constructor(
    private levelService: LevelService,
    private authService: AuthService,
  ) {}

  @Get('basic-levels-info')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getAllLevels(
    @Query('page') page: string = '0',
    @Query('take') take: string = '4',
    @Req() req: Request,
  ): Promise<PaginatedList<BasicLevelInfo>> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.levelService.getAllLevels(
      parseInt(page),
      parseInt(take),
      player,
    );
  }

  @Get(':levelId/tutorial')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getTutorial(
    @Param('levelId') levelId: string,
    @Req() req: Request,
  ): Promise<GetTutorialDto> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.levelService.getTutorial(levelId, player);
  }

  @Get(':levelId/question/:questionPosition')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getQuestion(
    @Param('levelId') levelId: string,
    @Param('questionPosition') questionPosition: string,
    @Req() req: Request,
  ): Promise<getQuestionDto> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.levelService.getQuestion(levelId, questionPosition, player);
  }

  @Post(`:levelId`)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiBody({ type: [SubmitAnswerRequestDto] })
  async submitAnswer(
    @Param('levelId') levelId: string,
    @Req() req: Request,
    @Body() answers: SubmitAnswerRequestDto[],
  ): Promise<SubmitAnswerResponseDto> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.levelService.submitAnswer(levelId, player, answers);
  }
}
