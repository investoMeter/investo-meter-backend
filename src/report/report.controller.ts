import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AtGuard } from 'src/auth/guards';
import { CreateReportDto } from './dto/CreateReportDto';
import { ReportResponseDto } from './dto/reportResponse.dto';
import { ReportService } from './report.service';
import { ReportRow } from './models/ReportRow';
import { PaginatedList } from 'src/common';
import { ReportDetailsDialog } from './models/ReportDetailsDialod';
import { CreateCommunityReportDto } from './dto/CreateCommReportDto';
import { CommunityReportResponseDto } from './dto/commReportResponce.dto';
import { CommunityReportRow } from './models/commReportRow';
import { CommunityReportDetailsDialog } from './models/commReportDetailsDialog';

@ApiTags('Reports')
@Controller('report')
export class ReportController {
  constructor(
    private reportService: ReportService,
    private authService: AuthService,
  ) {}

  @Post('create-report')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async createReport(
    @Req() req: Request,
    @Body() createReportDto: CreateReportDto,
  ): Promise<ReportResponseDto> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return await this.reportService.createReport(player, createReportDto);
  }

  @Get('get-reports-byCreatorId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getReportsByCreatorId(
    @Req() req: any,
    @Query('page') page: string,
    @Query('take') take: string,
  ): Promise<PaginatedList<ReportRow>> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.reportService.getReportsByCreatorId(
      player.userId,
      parseInt(page),
      parseInt(take),
    );
  }

  @Get('get-report-details')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getReportDetails(
    @Query('id') reportId: string,
  ): Promise<ReportDetailsDialog> {
    return this.reportService.getReportDetails(parseInt(reportId));
  }

  @Get('get-reports')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getAllReports(
    @Req() req: any,
    @Query('page') page: string,
    @Query('take') take: string,
  ): Promise<PaginatedList<ReportRow>> {
    await this.authService.AdminResolver((req as any).user.sub)
    return this.reportService.getAllReports(parseInt(page), parseInt(take));
  }

  @Put('close-report')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async closeReport(
    @Req() req: Request,
    @Query('id') reportId: string,
  ): Promise<void> {
    const admin = await this.authService.AdminResolver((req as any).user.sub);
    return await this.reportService.closeReport(
      admin.userId,
      parseInt(reportId),
    );
  }

  @Put('open-report')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async openReport(
    @Req() req: Request,
    @Query('id') reportId: string,
  ): Promise<void> {
    const admin = await this.authService.AdminResolver((req as any).user.sub);
    return await this.reportService.openReport(
      admin.userId,
      parseInt(reportId),
    );
  }

  @Post('community-reports')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new community report (Player)' })
  async createCommunityReport(
    @Req() req: Request,
    @Body() createReportDto: CreateCommunityReportDto,
    
  ): Promise<CommunityReportResponseDto> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return await this.reportService.createCommunityReport(player, createReportDto);
  }

  @Get('community-reports/creator')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get community reports created by the player' })
  async getCommunityReportsByCreatorId(
    @Req() req: any,
    @Query('page') page: string,
    @Query('take') take: string,
  ): Promise<PaginatedList<CommunityReportRow>> {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.reportService.getCommunityReportsByCreatorId(
      player.userId,
      parseInt(page),
      parseInt(take),
    );
  }

  @Get('community-reports/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth() @ApiOperation({ summary: 'Get details of a community report by ID (Player) & (Admin)' })
  async getCommunityReportDetails(
    @Param('id') reportId: string,
  ): Promise<CommunityReportDetailsDialog> {
    return this.reportService.getCommunityReportDetails(parseInt(reportId));
  }

  @Get('community-reports')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all community reports (Admin)' })
  async getAllCommunityReports(
    @Req() req: any,
    @Query('page') page: string,
    @Query('take') take: string,
  ): Promise<PaginatedList<CommunityReportRow>> {
    await this.authService.AdminResolver((req as any).user.sub)
    return this.reportService.getAllCommunityReports(parseInt(page), parseInt(take));
  }

  @Put('community-reports/:id/close')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close a community report by ID (Admin)' })
  async closeCommunityReport(
    @Req() req: Request,
    @Param('id') reportId: string,
  ): Promise<void> {
    const admin = await this.authService.AdminResolver((req as any).user.sub);
    return await this.reportService.closeCommunityReport(
      admin.userId,
      parseInt(reportId),
    );
  }

  @Put('community-reports/:id/open')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Open a community report by ID (Admin)' })
  async openCommunityReport(
    @Req() req: Request,
    @Param('id') reportId: string,
  ): Promise<void> {
    const admin = await this.authService.AdminResolver((req as any).user.sub);
    return await this.reportService.openCommunityReport(
      admin.userId,
      parseInt(reportId),
    );
  }
}
