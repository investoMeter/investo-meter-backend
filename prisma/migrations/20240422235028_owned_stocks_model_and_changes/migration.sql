/*
  Warnings:

  - You are about to drop the column `Price` on the `BuyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `roomContestId` on the `BuyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `Price` on the `SellRequest` table. All the data in the column will be lost.
  - You are about to drop the column `roomContestId` on the `SellRequest` table. All the data in the column will be lost.
  - Added the required column `price` to the `BuyRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `SellRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BuyRequest" DROP CONSTRAINT "BuyRequest_roomContestId_roomId_fkey";

-- DropForeignKey
ALTER TABLE "SellRequest" DROP CONSTRAINT "SellRequest_roomContestId_roomId_fkey";

-- AlterTable
ALTER TABLE "BuyRequest" DROP COLUMN "Price",
DROP COLUMN "roomContestId",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "SellRequest" DROP COLUMN "Price",
DROP COLUMN "roomContestId",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "OwnedStock" (
    "id" SERIAL NOT NULL,
    "stockId" INTEGER NOT NULL,
    "currentShares" INTEGER NOT NULL DEFAULT 0,
    "contestMembershipId" INTEGER NOT NULL,

    CONSTRAINT "OwnedStock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_contestId_roomId_fkey" FOREIGN KEY ("contestId", "roomId") REFERENCES "Room"("contestId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedStock" ADD CONSTRAINT "OwnedStock_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "contest_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedStock" ADD CONSTRAINT "OwnedStock_contestMembershipId_fkey" FOREIGN KEY ("contestMembershipId") REFERENCES "ContestMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_contestId_roomId_fkey" FOREIGN KEY ("contestId", "roomId") REFERENCES "Room"("contestId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
