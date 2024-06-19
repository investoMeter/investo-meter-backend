import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class CreateContestDto {
  @IsString({ message: 'invalid contest name' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  maxRoomCapacity: number;

  @IsNotEmpty()
  @IsPositive()
  startingMoney: number;

  // YYYY-MM-DDTHH:MM:SS
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
  @ApiProperty({
    example: '2024-04-07T12:30:00',
    description: 'The start date in the format YYYY-MM-DDTHH:MM:SS',
  })
  startDate: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
  @ApiProperty({
    example: '2024-04-10T12:30:00',
    description: 'The end date in the format YYYY-MM-DDTHH:MM:SS',
  })
  endDate: string;

  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  numberOfRooms: number;

  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  stocksShares: number;

  @ArrayNotEmpty()
  @ArrayMinSize(5)
  stocksIds: number[];
}
