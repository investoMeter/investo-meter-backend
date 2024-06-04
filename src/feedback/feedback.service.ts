import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { Player } from '@prisma/client';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async submitFeedback(
    player: Player,
    requestDto: SubmitFeedbackDto,
  ): Promise<void> {
    await this.prisma.feedback.create({
      data: {
        about: requestDto.about,
        content: requestDto.content,
        rating: requestDto.rating,
        playerId: player.userId,
      },
    });
  }
}
