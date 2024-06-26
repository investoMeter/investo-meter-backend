-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "communityId" TEXT;

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;
