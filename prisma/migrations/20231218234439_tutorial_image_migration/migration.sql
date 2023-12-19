/*
  Warnings:

  - Added the required column `tradeHistoryId` to the `LevelTrade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patternName` to the `levels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LevelTrade" ADD COLUMN     "tradeHistoryId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "levels" ADD COLUMN     "patternName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tutorials" ADD COLUMN     "imageStorageId" TEXT;

-- CreateTable
CREATE TABLE "LevelTradeHistory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "LevelMembershipId" INTEGER NOT NULL,

    CONSTRAINT "LevelTradeHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LevelTradeHistory" ADD CONSTRAINT "LevelTradeHistory_LevelMembershipId_fkey" FOREIGN KEY ("LevelMembershipId") REFERENCES "LevelMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelTrade" ADD CONSTRAINT "LevelTrade_tradeHistoryId_fkey" FOREIGN KEY ("tradeHistoryId") REFERENCES "LevelTradeHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
