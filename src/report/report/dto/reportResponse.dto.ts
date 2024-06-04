import { ReportSeverity, ReportState, ReportType } from '@prisma/client';
export class ReportResponseDto {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  state: ReportState;
  type: ReportType;
  severity: ReportSeverity;
}
