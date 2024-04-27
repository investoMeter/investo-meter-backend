import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CancelRequestDto {
  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  requestId: number;

  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  contestId: number;

  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  roomNumber: number;
}
