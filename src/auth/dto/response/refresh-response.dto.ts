import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshResponseDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
