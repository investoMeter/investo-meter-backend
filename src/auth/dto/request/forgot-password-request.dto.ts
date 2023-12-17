import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordRequestDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
