import { CommunityReportIssueType, ReportState } from '@prisma/client';
export class CommunityReportRow {
  id: number;
  createdAt: Date;
  title: string;
  state: ReportState;
  issueType: CommunityReportIssueType;
}