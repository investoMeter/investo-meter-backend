import {
  BadRequestException,
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
    if (
      await this.prisma.user.findFirst({
        where: {
          OR: [
            {
              username: registerDto.username,
            },
            {
              email: registerDto.email,
            },
          ],
        },
      })
    ) {
      throw new BadRequestException('username or email already exist');
    }

    const hashPassword = await this.hashPassword(registerDto.password);

    const newUser = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        email: registerDto.email,
        salt: hashPassword.salt,
        hashedPassword: hashPassword.hash,
      },
      select: { id: true, username: true, email: true },
    });

    await this.prisma.player.create({
      data: {
        userId: newUser.id,
      },
    });

    const tokens = await this.getTokens(
      newUser.id,
      newUser.username,
      newUser.email,
    );

    this.updateRtToken(newUser.id, tokens.refreshToken);

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
      select: {
        id: true,
        salt: true,
        hashedPassword: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `user with username: ${loginDto.username} is not found`,
      );
    }

    const inputPasswordHash = await bcrypt.hash(loginDto.password, user.salt);

    if (inputPasswordHash !== user.hashedPassword) {
      throw new ForbiddenException(`Access denied.`);
    }

    const tokens = await this.getTokens(user.id, user.username, user.email);

    this.updateRtToken(user.id, tokens.refreshToken);

    return {
      id: user.id,
      username: loginDto.username,
      email: user.email,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string): Promise<LogoutResponseDto> {
    await this.prisma.user.update({
      where: { id: userId, hashedRefreshToken: { not: null } },
      data: { hashedRefreshToken: null },
    });

    return { message: 'Logged out successfully!' };
  }

  async refresh(userId: string, rt: string): Promise<RefreshResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        hashedRefreshToken: true,
        username: true,
        email: true,
        salt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`user with id: ${userId} is not found`);
    }

    const hashedRefreshToken = await bcrypt.hash(rt, user.salt);

    if (hashedRefreshToken !== user.hashedRefreshToken) {
      throw new ForbiddenException(`Access denied.`);
    }

    const tokens = await this.getTokens(userId, user.username, user.email);
    return {
      id: userId,
      username: user.username,
      email: user.email,
      ...tokens,
    };
  }

  // Utils
  public async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return { salt, hash: await bcrypt.hash(password, salt) };
  }

  public async getTokens(
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

  public async updateRtToken(userId: string, rt: string) {
    try {
      const salt = (
        await this.prisma.user.findUnique({
          where: {
            id: userId,
          },
        })
      )?.salt;

      const rtHash = await bcrypt.hash(rt, salt ? salt : '');

      await this.prisma.user.update({
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
