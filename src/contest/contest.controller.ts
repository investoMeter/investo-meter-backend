import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ContestService } from './contest.service';
import { AuthService } from 'src/auth';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AtGuard } from 'src/auth/guards';
import { PaginatedList } from 'src/common';
import { ContestRow } from './models/ContestRow';
import { ContestDetailsDialog } from './models';
import { JoinContestDto } from './dto';
import { CreateContestDto } from './dto/createContest.dto';
import { ContestResponseDto } from './dto/contestResponse.dto';

@Controller('contest')
@ApiTags('contests')
export class ContestController {
  constructor(
    private contestService: ContestService,
    private authService: AuthService,
  ) {}

  @Get('get-all-contests')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getAllContests(
    @Query('page') page: string,
    @Query('take') take: string,
  ): Promise<PaginatedList<ContestRow>> {
    return this.contestService.getAllContests(parseInt(page), parseInt(take));
  }

  @Get('get-contest-details')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getContestDetails(
    @Query('id') contestId: string,
  ): Promise<ContestDetailsDialog> {
    return this.contestService.getContestDetails(parseInt(contestId));
  }

  @Post('join-contest')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async joinContest(
    @Req() req: any,
    @Body() requestDto: JoinContestDto,
  ): Promise<void> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.contestService.joinContest(player, requestDto);
  }

  @Post('create-contest')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  // TODO: Admin role
  async createContest(
    @Req() req: any,
    @Body() createContestDto: CreateContestDto,
  ): Promise<ContestResponseDto> {
    const admin = await this.authService.AdminResolver((req as any).user.sub);
    return await this.contestService.createContest(admin, createContestDto);
  }

  @Get('calculate-leaderboard')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getLeaderboard(
    @Req() req: any,
    @Query('contestId') contestId: string,
    @Query('roomId') roomId: string,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.contestService.calculateLeaderboard(player, parseInt(contestId), parseInt(roomId));
  }

}
