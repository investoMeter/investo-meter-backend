-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_sellerMembershipId_fkey";

-- AlterTable
ALTER TABLE "Trade" ALTER COLUMN "sellerMembershipId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sellerMembershipId_fkey" FOREIGN KEY ("sellerMembershipId") REFERENCES "ContestMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
