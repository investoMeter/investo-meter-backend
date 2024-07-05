/*
  Warnings:

  - The values [HARASSMENT,HATE_SPEECH,SPAM,INAPPROPRIATE_CONTENT,OTHER] on the enum `CommunityReportIssueType` will be removed. If these variants are still used in the database, this will fail.
  - The values [post,comment] on the enum `CommunityReportSubject` will be removed. If these variants are still used in the database, this will fail.
  - The values [low,medium,high,critical] on the enum `ReportSeverity` will be removed. If these variants are still used in the database, this will fail.
  - The values [open,close] on the enum `ReportState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CommunityReportIssueType_new" AS ENUM ('Harassment', 'Hate Speech', 'Spam', 'Inappropriate Content', 'Other');
ALTER TABLE "CommunityReport" ALTER COLUMN "issueType" TYPE "CommunityReportIssueType_new" USING ("issueType"::text::"CommunityReportIssueType_new");
ALTER TYPE "CommunityReportIssueType" RENAME TO "CommunityReportIssueType_old";
ALTER TYPE "CommunityReportIssueType_new" RENAME TO "CommunityReportIssueType";
DROP TYPE "CommunityReportIssueType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CommunityReportSubject_new" AS ENUM ('Post', 'Comment');
ALTER TABLE "CommunityReport" ALTER COLUMN "subject" TYPE "CommunityReportSubject_new" USING ("subject"::text::"CommunityReportSubject_new");
ALTER TYPE "CommunityReportSubject" RENAME TO "CommunityReportSubject_old";
ALTER TYPE "CommunityReportSubject_new" RENAME TO "CommunityReportSubject";
DROP TYPE "CommunityReportSubject_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReportSeverity_new" AS ENUM ('Low', 'Medium', 'High', 'Critical');
ALTER TABLE "Report" ALTER COLUMN "severity" TYPE "ReportSeverity_new" USING ("severity"::text::"ReportSeverity_new");
ALTER TYPE "ReportSeverity" RENAME TO "ReportSeverity_old";
ALTER TYPE "ReportSeverity_new" RENAME TO "ReportSeverity";
DROP TYPE "ReportSeverity_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReportState_new" AS ENUM ('Open', 'Closed');
ALTER TABLE "CommunityReport" ALTER COLUMN "state" TYPE "ReportState_new" USING ("state"::text::"ReportState_new");
ALTER TABLE "Report" ALTER COLUMN "state" TYPE "ReportState_new" USING ("state"::text::"ReportState_new");
ALTER TYPE "ReportState" RENAME TO "ReportState_old";
ALTER TYPE "ReportState_new" RENAME TO "ReportState";
DROP TYPE "ReportState_old";
COMMIT;
