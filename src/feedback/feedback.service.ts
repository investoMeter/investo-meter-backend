import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma";
import { Player } from "@prisma/client";
import { SubmitFeedbackDto } from "./dto/submit-feedback.dto";
import { PaginatedList } from "src/common";
import { GetFeedbackDto } from "./dto/get-feedback.dto";

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async submitFeedback(player: Player, requestDto: SubmitFeedbackDto): Promise<GetFeedbackDto> {
    return this.prisma.feedback.create({
      data: {
        ...requestDto,
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
        createdAt: "desc",
      },

      skip: page * take,
      take: take,
    });

    const feedbacksCount = await this.prisma.feedback.count();

    const result: PaginatedList<GetFeedbackDto> = {
      list: feedbacks,
      isLastPage:
        feedbacks.length < take || feedbacksCount <= page * take + take,
    };

    return result;
  }

  async getFeedbackDetails(id: number): Promise<GetFeedbackDto> {
    const feedbackDetails = await this.prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedbackDetails) {
      throw new NotFoundException(`Report with ID ${id} does not exist.`);
    }

    return feedbackDetails;
  }
}
