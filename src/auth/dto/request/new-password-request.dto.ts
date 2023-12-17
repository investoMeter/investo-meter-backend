import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class NewPasswordRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
