-- DropForeignKey
ALTER TABLE "BuyRequest" DROP CONSTRAINT "BuyRequest_playerId_fkey";

-- DropForeignKey
ALTER TABLE "SellRequest" DROP CONSTRAINT "SellRequest_playerId_fkey";

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_playerId_contestId_fkey" FOREIGN KEY ("playerId", "contestId") REFERENCES "ContestMembership"("playerId", "contestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_playerId_contestId_fkey" FOREIGN KEY ("playerId", "contestId") REFERENCES "ContestMembership"("playerId", "contestId") ON DELETE RESTRICT ON UPDATE CASCADE;
