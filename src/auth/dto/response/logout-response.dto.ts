import { IsNotEmpty } from 'class-validator';

export class LogoutResponseDto {
  @IsNotEmpty()
  accessToken: string;
}
