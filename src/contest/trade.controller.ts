import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TradeService } from './trade.service';
import { AuthService } from 'src/auth';
import { TradeRequestDto } from './dto/trades dto/trade-request.dto';
import { AtGuard } from 'src/auth/guards';
import { CancelRequestDto } from './dto/trades dto/cancel-request.dto';

@Controller('contest-trade')
@ApiTags('Trades')
export class TradeController {
  constructor(
    private tradeService: TradeService,
    private authService: AuthService,
  ) {}

  @Post('buy')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async createBuyRequest(@Req() req: any, @Body() requestDto: TradeRequestDto) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return await this.tradeService.createBuyRequest(player, requestDto);
  }

  @Post('sell')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async createSellRequest(
    @Req() req: any,
    @Body() requestDto: TradeRequestDto,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return await this.tradeService.createSellRequest(player, requestDto);
  }

  @Post('cancel-sell')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async cancelSellRequest(
    @Req() req: any,
    @Body() requestDto: CancelRequestDto,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return await this.tradeService.cancelSellRequest(player, requestDto);
  }

  @Post('cancel-buy')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async cancelBuyRequest(
    @Req() req: any,
    @Body() requestDto: CancelRequestDto,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.tradeService.cancelBuyRequest(player, requestDto);
  }

  @Get('open-trades')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getOpenTrades(
    @Req() req: any,
    @Query('contestId') contestId: string,
    @Query('roomId') roomId: string,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.tradeService.getOpenTrades(player, parseInt(contestId), parseInt(roomId));
  }

  @Get('closed-trades')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getClosedTrades(
    @Req() req: any,
    @Query('contestId') contestId: string,
    @Query('roomId') roomId: string,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.tradeService.getClosedTrades(player, parseInt(contestId), parseInt(roomId));
  }
}
