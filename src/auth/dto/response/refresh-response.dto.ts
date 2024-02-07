import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshResponseDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;
}
