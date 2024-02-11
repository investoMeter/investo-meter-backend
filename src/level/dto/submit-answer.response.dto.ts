import { IsNumber } from 'class-validator';

export class SubmitAnswerResponseDto {
  @IsNumber()
  readonly correctAnswers: number;

  @IsNumber()
  readonly wrongAnswers: number;

  @IsNumber()
  readonly totalQuestions: number;
}
