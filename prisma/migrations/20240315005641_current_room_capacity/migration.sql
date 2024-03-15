/*
  Warnings:

  - Made the column `roomContestId` on table `StockHistory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `roomId` on table `StockHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ContestMembership" DROP CONSTRAINT "ContestMembership_roomId_fkey";

-- DropForeignKey
ALTER TABLE "StockHistory" DROP CONSTRAINT "StockHistory_roomContestId_roomId_fkey";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "currentCapacity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "StockHistory" ALTER COLUMN "roomContestId" SET NOT NULL,
ALTER COLUMN "roomId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ContestMembership" ADD CONSTRAINT "ContestMembership_contestId_roomId_fkey" FOREIGN KEY ("contestId", "roomId") REFERENCES "Room"("contestId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHistory" ADD CONSTRAINT "StockHistory_roomContestId_roomId_fkey" FOREIGN KEY ("roomContestId", "roomId") REFERENCES "Room"("contestId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
