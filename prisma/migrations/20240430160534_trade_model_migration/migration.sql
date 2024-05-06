/*
  Warnings:

  - You are about to drop the column `memberId` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `tradeType` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `contestStockId` on the `contest_stock_price` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contestId,roomNumber]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `buyerMembershipId` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerMembershipId` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_memberId_fkey";

-- DropIndex
DROP INDEX "contest_stock_price_contest_stock_id_foreign";

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "memberId",
DROP COLUMN "tradeType",
ADD COLUMN     "buyerMembershipId" INTEGER NOT NULL,
ADD COLUMN     "sellerMembershipId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "contest_stock_price" DROP COLUMN "contestStockId";

-- CreateIndex
CREATE UNIQUE INDEX "Room_contestId_roomNumber_key" ON "Room"("contestId", "roomNumber");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_buyerMembershipId_fkey" FOREIGN KEY ("buyerMembershipId") REFERENCES "ContestMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sellerMembershipId_fkey" FOREIGN KEY ("sellerMembershipId") REFERENCES "ContestMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
