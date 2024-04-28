
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
import { ApiBearerAuth } from '@nestjs/swagger';
import { AtGuard } from 'src/auth/guards';
import { CreateReportDto } from './dto/CreateReportDto';
import { ReportResponseDto } from './dto/reportResponse.dto';
import { ReportService } from './report.service';
import { ReportRow } from './models/ReportRow';
import { PaginatedList } from 'src/common';
import { ReportDetailsDialog } from './models/ReportDetailsDialod';

@Controller('report')
export class ReportController {
    constructor(
        private reportService: ReportService,
        private authService: AuthService,
      ) { }

    @Post('create-report')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AtGuard)
    @ApiBearerAuth()
    // TODO: Admin role 
    async createReport(@Req() req: Request,
        @Body() createReportDto: CreateReportDto): Promise<ReportResponseDto> {
        const player = await this.authService.playerResolver((req as any).user.sub);
        return await this.reportService.createReport(player, createReportDto);
    }

    @Get('get-reports-byCreatorId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AtGuard)
    @ApiBearerAuth()
    async getReportsByCreatorId( @Req() req: any,
      @Query('page') page: string,
      @Query('take') take: string,
    ): Promise<PaginatedList<ReportRow>> {
      const player = await this.authService.playerResolver((req as any).user.sub);
      return this.reportService.getReportsByCreatorId(player.userId,parseInt(page), parseInt(take));
    }

    @Get('get-report-details')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AtGuard)
    @ApiBearerAuth()
    async getReportDetails(
      @Query('id') contestId: string,
    ): Promise<ReportDetailsDialog> {
      return this.reportService.getReportDetails(parseInt(contestId));
    }

    
}
