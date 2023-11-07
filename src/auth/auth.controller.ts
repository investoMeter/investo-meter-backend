import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginRequestDto,
  LogoutRequestDto,
  RefreshRequestDto,
  RegisterRequestDto,
} from './dto/request';
import {
  LoginResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
} from './dto/response';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/local/register')
  async register(
    @Body() registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('/local/login')
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('/logout')
  async logout(
    @Body() logoutDto: LogoutRequestDto,
  ): Promise<LogoutResponseDto> {
    return this.authService.logout(logoutDto);
  }

  @Post('/refresh')
  async refresh(
    @Body() refreshDto: RefreshRequestDto,
  ): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshDto);
  }
}
