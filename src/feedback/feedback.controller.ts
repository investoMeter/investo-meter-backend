import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AtGuard } from 'src/auth/guards';
import { FeedbackService } from './feedback.service';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@Controller('feedback')
@ApiTags('feedbacks')
export class FeedbackController {
  constructor(
    private feedbackService: FeedbackService,
    private authService: AuthService,
  ) {}

  @Post('submit-feedback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async sumbitFeedback(
    @Req() req: any,
    @Body() requestDto: SubmitFeedbackDto,
  ): Promise<void> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.feedbackService.submitFeedback(player, requestDto);
  }
}
