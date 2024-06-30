-- CreateEnum
CREATE TYPE "CommunityReportIssueType" AS ENUM ('HARASSMENT', 'HATE_SPEECH', 'SPAM', 'INAPPROPRIATE_CONTENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CommunityReportSubject" AS ENUM ('post', 'comment');

-- CreateTable
CREATE TABLE "CommunityReport" (
    "id" SERIAL NOT NULL,
    "adminId" TEXT,
    "creatorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" "CommunityReportSubject" NOT NULL,
    "issueType" "CommunityReportIssueType" NOT NULL,
    "state" "ReportState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Player"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
