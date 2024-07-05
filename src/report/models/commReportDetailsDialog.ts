import { CommunityReportIssueType, CommunityReportSubject, ReportState } from '@prisma/client';

export class CommunityReportDetailsDialog {
  id: number;
  title: string;
  state: ReportState;
  subject: CommunityReportSubject;
  createdAt: Date;
  issueType: CommunityReportIssueType;
  content: string;
  adminId: string | null;
  creatorId: string;
  subjectId: string;
}
