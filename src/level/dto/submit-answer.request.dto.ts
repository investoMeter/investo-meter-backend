import { ApiProperty } from '@nestjs/swagger';
import { TradeType } from '@prisma/client';
import { IsEnum, IsNumber } from 'class-validator';

export class SubmitAnswerRequestDto {
  @IsNumber()
  readonly questionId: number;

  @IsEnum(TradeType)
  readonly tradeType: TradeType;
}
