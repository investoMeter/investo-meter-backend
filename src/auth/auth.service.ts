import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  RegisterRequestDto,
  LoginRequestDto,
  NewPasswordRequestDto,
  ValidateOtpTokenDto,
  ForgotPasswordRequestDto,
} from './dto/request';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './types';
import {
  LoginResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
} from './dto/response';
import { MailerService } from '@nestjs-modules/mailer';
import { Player } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailerService: MailerService,
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
        name: registerDto.name,
        email: registerDto.email,
        salt: hashPassword.salt,
        hashedPassword: hashPassword.hash,
      },
      select: { id: true, name: true, username: true, email: true },
    });

    await this.prisma.player.create({
      data: {
        userId: newUser.id,
        levelMemberships: {
          create: {
            levelId: 1,
            failuresCount: 0,
          },
        },
      },
    });

    const tokens = await this.getTokens(
      newUser.id,
      newUser.name,
      newUser.username,
      newUser.email,
    );

    this.updateRtToken(newUser.id, tokens.refreshToken);

    return {
      id: newUser.id,
      name: newUser.name,
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
        name: true,
        username: true,
        email: true,
        salt: true,
        hashedPassword: true,
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

    const tokens = await this.getTokens(
      user.id,
      user.name,
      user.username,
      user.email,
    );

    this.updateRtToken(user.id, tokens.refreshToken);

    return {
      id: user.id,
      name: user.name,
      username: loginDto.username,
      email: user.email,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
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
        name: true,
        username: true,
        email: true,
        hashedRefreshToken: true,
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

    const tokens = await this.getTokens(
      userId,
      user.name,
      user.username,
      user.email,
    );

    return {
      id: userId,
      name: user.name,
      username: user.username,
      email: user.email,
      ...tokens,
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordRequestDto,
  ): Promise<any> {
    if (
      await this.prisma.user.count({
        where: { email: forgotPasswordDto.email },
      })
    ) {
      const OtpToken = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');

      await this.prisma.passwordReset.upsert({
        where: {
          email: forgotPasswordDto.email,
        },
        update: {
          token: OtpToken,
        },
        create: {
          email: forgotPasswordDto.email,
          token: OtpToken,
        },
      });

      await this.mailerService.sendMail({
        to: forgotPasswordDto.email,
        subject: 'Password Reset',
        html: `
        <h1>Password Reset</h1>
        <br/>
        <p>If you have asked for a password recovery please enter this token: ${OtpToken}</p>
        <br/>
        <p>If you did not please ignore this email.</p>`,
      });
    }

    return {
      message: `If the email ${forgotPasswordDto.email} exists, you will receive an email with a token to reset your password.`,
    };
  }

  async validateOtpToken(validateOtpTokenDto: ValidateOtpTokenDto) {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { email: validateOtpTokenDto.email },
      select: { token: true, createdAt: true },
    });

    if (
      !passwordReset ||
      new Date().getTime() - passwordReset.createdAt.getTime() > 60 * 60 * 1000
    ) {
      throw new BadRequestException('Token expired');
    }

    if (passwordReset.token === validateOtpTokenDto.token) {
      return {
        message: 'Otp is valid',
      };
    }
    throw new NotFoundException('Otp is not valid');
  }

  async setNewPassword(newPasswordDto: NewPasswordRequestDto) {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: {
        email: newPasswordDto.email,
      },
    });

    if (!passwordReset) {
      throw new NotFoundException(`user is not found`);
    }

    if (
      passwordReset.token !== newPasswordDto.token ||
      new Date().getTime() - passwordReset.createdAt.getTime() > 60 * 60 * 1000
    ) {
      throw new ForbiddenException(`Token expired`);
    }

    const hashPassword = await this.hashPassword(newPasswordDto.newPassword);

    await this.prisma.user.update({
      where: {
        email: newPasswordDto.email,
      },
      data: {
        salt: hashPassword.salt,
        hashedPassword: hashPassword.hash,
      },
    });

    await this.prisma.passwordReset.delete({
      where: {
        email: newPasswordDto.email,
      },
    });

    return { message: 'Password is reset successfully!' };
  }

  // Utils
  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return { salt, hash: await bcrypt.hash(password, salt) };
  }

  public async getTokens(
    userId: string,
    name: string,
    username: string,
    email: string,
  ): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwt.signAsync(
        {
          sub: userId,
          name,
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
          name,
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

  public async playerResolver(playerId?: string): Promise<Player> {
    if (!!!playerId) {
      throw new BadRequestException(`playerId is not provided`);
    }

    const player = await this.prisma.player.findUnique({
      where: {
        userId: playerId,
      },
      include: { user: true, contestMemberships: true, levelMemberships: true },
    });

    if (!player) {
      throw new NotFoundException(`player with id: ${playerId} is not found`);
    }

    return player;
  }

  public async AdminResolver(adminId?: string) {
    if (!!!adminId) {
      throw new BadRequestException(`adminId is not provided`);
    }

    const admin = await this.prisma.admin.findUnique({
      where: {
        userId: adminId,
      },
    });
    if (!admin) {
      throw new NotFoundException(`admin with id: ${adminId} is not found`);
    }
    return admin;
  }

  async adminRegister(
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
        name: registerDto.name,
        email: registerDto.email,
        salt: hashPassword.salt,
        hashedPassword: hashPassword.hash,
      },
      select: { id: true, name: true, username: true, email: true },
    });

    await this.prisma.admin.create({
      data: {
        userId: newUser.id,
      },
    });

    const tokens = await this.getTokens(
      newUser.id,
      newUser.name,
      newUser.username,
      newUser.email,
    );

    this.updateRtToken(newUser.id, tokens.refreshToken);

    return {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }
}
