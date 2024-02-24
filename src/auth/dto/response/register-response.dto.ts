import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterResponseDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly access_token: string;

  @IsNotEmpty()
  @IsString()
  readonly refresh_token: string;
}
