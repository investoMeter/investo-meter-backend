import { IsNotEmpty } from 'class-validator';

export class LogoutRequestDto {
  @IsNotEmpty()
  accessToken: string;
}
