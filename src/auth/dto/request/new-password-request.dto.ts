import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class NewPasswordRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  newPassword: string;
}
