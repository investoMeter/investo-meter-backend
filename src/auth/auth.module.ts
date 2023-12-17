import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategy';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { env } from 'process';

@Module({
  imports: [
    JwtModule.register({}),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: env.MAIL_USER,
          pass: env.MAIL_PASS,
        },
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
