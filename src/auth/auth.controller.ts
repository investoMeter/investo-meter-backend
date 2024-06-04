import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterRequestDto,
  LoginRequestDto,
  NewPasswordRequestDto,
  ValidateOtpTokenDto,
  ForgotPasswordRequestDto,
} from './dto/request';
import {
  LoginResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
} from './dto/response';
import { RtGuard } from './guards';
import { AtGuard } from './guards';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('local/register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('local/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  async logout(@Req() req: Request) {
    const user = (req as any).user;
    return this.authService.logout(user['sub']);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(RtGuard)
  async refresh(@Req() req: Request): Promise<RefreshResponseDto> {
    const user = (req as any).user;
    return this.authService.refresh(user['sub'], user['refreshToken']);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async forgetPassword(
    @Body() forgotPasswordDto: ForgotPasswordRequestDto,
  ): Promise<any> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('validate-otp-token')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.FOUND)
  @HttpCode(HttpStatus.NOT_FOUND)
  async validateOtpToken(
    @Body() validateOtpTokenDto: ValidateOtpTokenDto,
  ): Promise<any> {
    return this.authService.validateOtpToken(validateOtpTokenDto);
  }

  @Put('new-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async newPassword(
    @Body() newPasswordDto: NewPasswordRequestDto,
  ): Promise<any> {
    return this.authService.setNewPassword(newPasswordDto);
  }

  @Post('local/admin-register')
  @HttpCode(HttpStatus.CREATED)
  async adminRegister(
    @Body() registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.adminRegister(registerDto);
  }
}
