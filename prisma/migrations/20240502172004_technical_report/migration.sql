/*
  Warnings:

  - You are about to drop the `reportHundler` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "reportHundler" DROP CONSTRAINT "reportHundler_adminId_fkey";

-- DropForeignKey
ALTER TABLE "reportHundler" DROP CONSTRAINT "reportHundler_reportId_fkey";

-- AlterTable
ALTER TABLE "report" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "reportHundler";

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "players"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
