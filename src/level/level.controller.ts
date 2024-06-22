import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { EditTutorialDto } from './dto/edit-tutorial.leveldto';

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

  @Get(':levelId/tutorial-admin')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getTutorialAdmin(
    @Req() req: Request,
    @Param('levelId') levelId: string,
  ): Promise<GetTutorialDto> {
    await this.authService.AdminResolver((req as any).user.sub);
    return this.levelService.getTutorialAdmin(levelId);
  }

  @Put("edit/tutorial")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async editContest(
    @Req() req: Request,
    @Body() tutorialDto: GetTutorialDto,
  ): Promise<EditTutorialDto> {
    await this.authService.AdminResolver((req as any).user.sub);
    return await this.levelService.editTutorial(tutorialDto);
  }
}
