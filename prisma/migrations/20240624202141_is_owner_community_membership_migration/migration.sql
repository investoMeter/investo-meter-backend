-- DropForeignKey
ALTER TABLE "ContestContestStock" DROP CONSTRAINT "ContestContestStock_contestId_fkey";

-- AlterTable
ALTER TABLE "CommunityMembership" ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "ContestContestStock" ADD CONSTRAINT "ContestContestStock_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
