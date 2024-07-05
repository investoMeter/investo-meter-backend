import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth';
import { AtGuard } from 'src/auth/guards';
import { ProfileService } from './profile.service';
import { PrevContestDto } from './dto/prevContest.dto';
import { playerDataDto } from './dto/playerData.dto';
import { UpcomingContestDto } from './dto/upcomingContest.dto';

@Controller('profile')
@ApiTags('profile')
export class ProfileController {
  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
  ) { }

  @Get('get-contest-history')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getPreviousContests(@Req() req: Request): Promise<PrevContestDto[]> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.profileService.getPreviousContests(player);
  }

  @Get('get-upcoming-contests')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getUpcomingContests(@Req() req: Request): Promise<UpcomingContestDto[]> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.profileService.getUpcomingContests(player);
  }

  @Get('get-player-info')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getPlayerInfo(@Req() req: Request): Promise<playerDataDto> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.profileService.getPlayerInfo(player);
  }
}
