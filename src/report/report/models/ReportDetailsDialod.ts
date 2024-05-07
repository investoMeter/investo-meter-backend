import { ReportSeverity, ReportState, ReportType } from "@prisma/client";

export class ReportDetailsDialog {
    id: number
    title:string
    state: ReportState
    severity:ReportSeverity
    createdAt: Date
    type: ReportType
    content:string
    adminId:string |null
    creatorId:string
  }
  