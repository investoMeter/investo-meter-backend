import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterRequestDto, LoginRequestDto } from './dto/request';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './types';
import {
  LoginResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
} from './dto/response';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(
    registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const hashPassword = await this.hashPassword(registerDto.password);

    const newPlayer = await this.prisma.player.create({
      data: {
        username: registerDto.username,
        createdAt: new Date(),
        salt: hashPassword.salt,
        hashedPassword: hashPassword.hash,
        email: registerDto.email,
      },
      select: { id: true, username: true, email: true },
    });

    const tokens = await this.getTokens(
      newPlayer.id,
      newPlayer.username,
      newPlayer.email,
    );

    this.updateRtToken(newPlayer.id, tokens.refreshToken);

    return {
      id: newPlayer.id,
      username: newPlayer.username,
      email: newPlayer.email,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const player = await this.prisma.player.findUnique({
      where: { username: loginDto.username },
      select: {
        id: true,
        salt: true,
        hashedPassword: true,
        username: true,
        email: true,
      },
    });

    if (!player) {
      throw new NotFoundException(
        `player with username: ${loginDto.username} is not found`,
      );
    }

    const inputPasswordHash = await bcrypt.hash(loginDto.password, player.salt);

    if (inputPasswordHash !== player.hashedPassword) {
      throw new ForbiddenException(`Access denied.`);
    }

    const tokens = await this.getTokens(
      player.id,
      player.username,
      player.email,
    );

    this.updateRtToken(player.id, tokens.refreshToken);

    return {
      id: player.id,
      username: loginDto.username,
      email: player.email,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string): Promise<LogoutResponseDto> {
    await this.prisma.player.update({
      where: { id: userId, hashedRefreshToken: { not: null } },
      data: { hashedRefreshToken: null },
    });

    return { message: 'Logged out successfully!' };
  }

  async refresh(userId: string, rt: string): Promise<RefreshResponseDto> {
    const player = await this.prisma.player.findUnique({
      where: { id: userId },
      select: {
        hashedRefreshToken: true,
        username: true,
        email: true,
        salt: true,
      },
    });
    if (!player) {
      throw new NotFoundException(`player with id: ${userId} is not found`);
    }

    const hashedRefreshToken = await bcrypt.hash(rt, player.salt);

    if (hashedRefreshToken !== player.hashedRefreshToken) {
      throw new ForbiddenException(`Access denied.`);
    }

    const tokens = await this.getTokens(userId, player.username, player.email);
    return {
      id: userId,
      username: player.username,
      email: player.email,
      ...tokens,
    };
  }

  // Utils
  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return { salt, hash: await bcrypt.hash(password, salt) };
  }

  private async getTokens(
    userId: string,
    username: string,
    email: string,
  ): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwt.signAsync(
        {
          sub: userId,
          username,
          email,
        },
        {
          secret: 'at-secret',
          expiresIn: 60 * 60 * 24, // day
        },
      ),
      this.jwt.signAsync(
        {
          sub: userId,
          username,
          email,
        },
        {
          secret: 'rt-secret',
          expiresIn: 60 * 60 * 24 * 30, // month
        },
      ),
    ]);
    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  private async updateRtToken(userId: string, rt: string) {
    try {
      const salt = (
        await this.prisma.player.findUnique({
          where: {
            id: userId,
          },
        })
      ).salt;

      const rtHash = await bcrypt.hash(rt, salt);

      await this.prisma.player.update({
        where: {
          id: userId,
        },
        data: {
          hashedRefreshToken: rtHash,
        },
      });
    } catch (err) {
      throw err;
    }
  }
}
