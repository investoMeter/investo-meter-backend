import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubmitFeedbackDto {
  @ApiProperty({
    description: 'Description of the feedback topic',
    example: 'Overall experience',
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  about: string;

  @ApiProperty({
    description: 'Content of the feedback',
    example: 'Very good app',
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Rating given by the user', example: 5 })
  @IsNumber()
  @IsNotEmpty()
  rating: number;
}
