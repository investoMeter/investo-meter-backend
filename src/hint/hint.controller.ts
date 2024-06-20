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
import { AuthService } from 'src/auth';
import { AtGuard } from 'src/auth/guards';
import { HintService } from './hint.service';
import { GetHintRequestDto, GetHintResponseDto } from './dto';

@Controller('hint')
@ApiTags('hint')
export class HintController {
  constructor(
    private auth: AuthService,
    private service: HintService,
  ) {}

  @Post('get-hint')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getHint(
    @Req() req: any,
    @Body() requestDto: GetHintRequestDto,
  ): Promise<GetHintResponseDto> {
    var player = await this.auth.playerResolver((req as any).user.sub);
    return this.service.getStockPrediciton(requestDto, player);
  }
}
