import { CommunityReportIssueType, CommunityReportSubject, ReportState } from '@prisma/client';
export class CommunityReportResponseDto {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  state: ReportState;
  issueType: CommunityReportIssueType;
  subject: CommunityReportSubject;
  subjectId:string
}
