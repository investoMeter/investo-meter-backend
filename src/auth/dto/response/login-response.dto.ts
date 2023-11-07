import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginResponseDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @IsEmail()
  @IsNotEmpty()
  readonly accessToken: string;

  @IsNotEmpty()
  @IsString()
  readonly refreshToken: string;
}
