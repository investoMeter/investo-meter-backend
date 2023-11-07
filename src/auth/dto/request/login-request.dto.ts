import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
