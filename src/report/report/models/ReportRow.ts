import { ReportState, ReportType } from '@prisma/client';
export class ReportRow {
    id: number;
    createdAt: Date;
    title: string;
    state:ReportState;
    type:ReportType
  }
  