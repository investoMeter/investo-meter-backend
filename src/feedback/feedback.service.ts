import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { Player } from '@prisma/client';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { PaginatedList } from 'src/common';
import { GetFeedbackDto } from './dto/get-feedback.dto';

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
////////////////////////  ADMIN SIDE /////////////////////////////////////////////////

  async getAllFeedbacks(
    page: number = 0,
    take: number = 8,
  ): Promise<PaginatedList<GetFeedbackDto>> {
    const feedbacks = await this.prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc',
      },

      skip: page * take,
      take: take,
    });
    const feedbacksCount = await this.prisma.feedback.count({});
    const result: PaginatedList<GetFeedbackDto> = {
      list: feedbacks.map((feedback) => {
        return {
        id: feedback.id,
        about: feedback.about,
        content: feedback.content,
        rating: feedback.rating,
        createdAt:feedback.createdAt,
        playerId: feedback.playerId,
        };
      }),
      isLastPage: feedbacks.length < take || feedbacksCount <= page * take + take,
    };

    return result;
  }


  async getFeedbackDetails(id: number): Promise<GetFeedbackDto> {
    const feedbackDetails = await this.prisma.feedback.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        about: true,
        content: true,
        rating : true,
        createdAt:true,
        playerId:true 
      },
    });

    if (!feedbackDetails) {
      throw new NotFoundException(
        'The report you are seeking with ID ' + id + ' does not exist.',
      );
    }

    const result: GetFeedbackDto = {
      id: feedbackDetails.id,
      about: feedbackDetails.about,
      content: feedbackDetails.content,
      rating : feedbackDetails.rating,
      createdAt:feedbackDetails.createdAt,
      playerId:feedbackDetails.playerId 
    };

    return result;
  }

}
