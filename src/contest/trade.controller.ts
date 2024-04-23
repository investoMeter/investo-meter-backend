import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TradeService } from './trade.service';
import { AuthService } from 'src/auth';
import { TradeRequestDto } from './dto/trades dto/trade-request.dto';
import { AtGuard } from 'src/auth/guards';

@Controller('contest-trade')
@ApiTags('Trades')
export class TradeController {

    constructor(
        private tradeService: TradeService,
        private authService: AuthService,
    ) { }

    @Post('buy')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AtGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    async createBuyRequest(@Req() req: any,
        @Body() requestDto: TradeRequestDto) {
        const player = await this.authService.playerResolver((req as any).user.sub);
        return await this.tradeService.createBuyRequest(player, requestDto);
    }

    @Post('sell')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AtGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    async createSellRequest(@Req() req: any,
        @Body() requestDto: TradeRequestDto) {
        const player = await this.authService.playerResolver((req as any).user.sub);
        return await this.tradeService.createSellRequest(player, requestDto);
    }

}