import { Injectable, NotFoundException } from '@nestjs/common';
import { Player } from '@prisma/client';
import { CreateReportDto } from './dto/CreateReportDto';
import { ReportResponseDto } from './dto/reportResponse.dto';
import { PrismaService } from 'src/prisma';
import { ReportState } from '@prisma/client';
import { PaginatedList } from 'src/common';
import { ReportRow } from './models/ReportRow';
import { ReportDetailsDialog } from './models/ReportDetailsDialod';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async createReport(player: Player, createReportDto: CreateReportDto) {
    const { title, content, type, severity } = createReportDto;

    const dateObject = new Date(Date.now());
    dateObject.setHours(dateObject.getHours() + 3);

    const reportData = {
      content,
      creatorId: player.userId,
      title,
      type,
      severity,
      createdAt: new Date(dateObject), // Convert timestamp to Date object
      state: ReportState.open,
    };

    try {
      const newReport = await this.prisma.report.create({
        data: reportData,
      });

      const reportResponseDto: ReportResponseDto = {
        id: newReport.id,
        title: newReport.title,
        content: newReport.content,
        createdAt: newReport.createdAt,
        type: newReport.type,
        state: newReport.state,
        severity: newReport.severity,
      };

      return reportResponseDto;
    } catch (error) {
      // Handle any errors that might occur during report creation
      console.error('Error creating report:', error);
      throw new Error('Failed to create report');
    }
  }

  async getReportsByCreatorId(
    creatortId: string,
    page: number = 0,
    take: number = 8,
  ): Promise<PaginatedList<ReportRow>> {
    const reports = await this.prisma.report.findMany({
      where: {
        creatorId: {
          equals: creatortId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        type: true,
        state: true,
        severity: true,
        creatorId: true,
        adminId: true,
      },
      skip: page * take,
      take: take,
    });
    const reportsCount = await this.prisma.report.count({
      where: {
        creatorId: {
          equals: creatortId,
        },
      },
    });

    const result: PaginatedList<ReportRow> = {
      list: reports.map((report) => {
        return {
          id: report.id,
          createdAt: report.createdAt,
          title: report.title,
          state: report.state,
          type: report.type,
          adminId: report.adminId,
          creatorId: report.creatorId,
        };
      }),
      isLastPage: reports.length < take || reportsCount <= page * take + take,
    };
    return result;
  }

  async getReportDetails(reportId: number): Promise<ReportDetailsDialog> {
    const reportDetails = await this.prisma.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        type: true,
        state: true,
        severity: true,
        creatorId: true,
        adminId: true,
      },
    });

    if (!reportDetails) {
      throw new NotFoundException(
        'The report you are seeking with ID ' + reportId + ' does not exist.',
      );
    }

    const result: ReportDetailsDialog = {
      id: reportDetails.id,

      createdAt: reportDetails.createdAt,
      title: reportDetails.title,
      state: reportDetails.state,
      type: reportDetails.type,
      severity: reportDetails.severity,
      content: reportDetails.content,
      adminId: reportDetails.adminId,
      creatorId: reportDetails.creatorId,
    };

    return result;
  }

  //admin side

  async getAllReports(
    page: number = 0,
    take: number = 8,
  ): Promise<PaginatedList<ReportRow>> {
    const reports = await this.prisma.report.findMany({
      orderBy: {
        createdAt: 'desc',
      },

      skip: page * take,
      take: take,
    });
    const reportsCount = await this.prisma.report.count({});
    const result: PaginatedList<ReportRow> = {
      list: reports.map((report) => {
        return {
          id: report.id,
          createdAt: report.createdAt,
          title: report.title,
          state: report.state,
          type: report.type,
        };
      }),
      isLastPage: reports.length < take || reportsCount <= page * take + take,
    };

    return result;
  }

  async closeReport(adminId: string, reportId: number) {
    await this.prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        state: ReportState.close,
        adminId: adminId,
      },
    });
  }

  async openReport(adminId: string, reportId: number) {
    await this.prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        state: ReportState.open,
        adminId: null,
      },
    });
  }
}
