import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ValidateOtpTokenDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly token: string;
}
