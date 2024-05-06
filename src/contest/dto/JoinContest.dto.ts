import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class JoinContestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  contestId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  roomNumber: number;
}
