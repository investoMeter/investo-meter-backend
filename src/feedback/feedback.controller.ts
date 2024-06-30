import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AtGuard } from 'src/auth/guards';
import { FeedbackService } from './feedback.service';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { PaginatedList } from 'src/common';
import { GetFeedbackDto } from './dto/get-feedback.dto';

@Controller('feedback')
@ApiTags('feedbacks')
export class FeedbackController {
  constructor(
    private feedbackService: FeedbackService,
    private authService: AuthService,
  ) {}

  @Post('submit-feedback')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async sumbitFeedback(
    @Req() req: any,
    @Body() requestDto: SubmitFeedbackDto,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.feedbackService.submitFeedback(player, requestDto);
  }


  @Get('get-feedback-details')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getReportDetails(
    @Query('id') feedbackId: string,
  ): Promise<GetFeedbackDto> {
    return this.feedbackService.getFeedbackDetails(parseInt(feedbackId));
  }

  @Get('get-feedbacks')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getAllReports(
    @Req() req: any,
    @Query('page') page: string,
    @Query('take') take: string,
  ): Promise<PaginatedList<GetFeedbackDto>> {
    //await this.authService.AdminResolver((req as any).user.sub)
    return this.feedbackService.getAllFeedbacks(parseInt(page), parseInt(take));
  }
}
