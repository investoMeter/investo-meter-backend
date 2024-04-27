/*
  Warnings:

  - You are about to drop the column `roomId` on the `ContestMembership` table. All the data in the column will be lost.
  - The primary key for the `Room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `StockHistory` table. All the data in the column will be lost.
  - You are about to drop the column `stockCount` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Trade` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contestStockId]` on the table `StockHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `startingShares` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomNumber` to the `ContestMembership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentShares` to the `StockHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomNumber` to the `StockHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tradeType` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "ContestMembership" DROP CONSTRAINT "ContestMembership_contestId_roomId_fkey";

-- DropForeignKey
ALTER TABLE "StockHistory" DROP CONSTRAINT "StockHistory_roomContestId_roomId_fkey";

-- DropIndex
DROP INDEX "Room_id_key";

-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "startingShares" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ContestMembership" DROP COLUMN "roomId",
ADD COLUMN     "roomNumber" INTEGER NOT NULL,
ALTER COLUMN "currentMoneyAmount" SET DEFAULT 0.0,
ALTER COLUMN "currentMoneyAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Room" DROP CONSTRAINT "Room_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("contestId", "roomNumber");

-- AlterTable
ALTER TABLE "StockHistory" DROP COLUMN "roomId",
ADD COLUMN     "currentShares" INTEGER NOT NULL,
ADD COLUMN     "roomNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "stockCount",
DROP COLUMN "type",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tradeType" "TradeType" NOT NULL;

-- CreateTable
CREATE TABLE "BuyRequest" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RequestStatus" NOT NULL,
    "playerId" TEXT NOT NULL,
    "contestStockId" INTEGER NOT NULL,
    "roomNumber" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,

    CONSTRAINT "BuyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnedStock" (
    "id" SERIAL NOT NULL,
    "stockId" INTEGER NOT NULL,
    "currentShares" INTEGER NOT NULL DEFAULT 0,
    "contestMembershipId" INTEGER NOT NULL,

    CONSTRAINT "OwnedStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellRequest" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RequestStatus" NOT NULL,
    "playerId" TEXT NOT NULL,
    "contestStockId" INTEGER NOT NULL,
    "roomNumber" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,

    CONSTRAINT "SellRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnedStock_stockId_contestMembershipId_key" ON "OwnedStock"("stockId", "contestMembershipId");

-- CreateIndex
CREATE UNIQUE INDEX "StockHistory_contestStockId_key" ON "StockHistory"("contestStockId");

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_contestStockId_fkey" FOREIGN KEY ("contestStockId") REFERENCES "contest_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_contestId_roomNumber_fkey" FOREIGN KEY ("contestId", "roomNumber") REFERENCES "Room"("contestId", "roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestMembership" ADD CONSTRAINT "ContestMembership_contestId_roomNumber_fkey" FOREIGN KEY ("contestId", "roomNumber") REFERENCES "Room"("contestId", "roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedStock" ADD CONSTRAINT "OwnedStock_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "contest_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedStock" ADD CONSTRAINT "OwnedStock_contestMembershipId_fkey" FOREIGN KEY ("contestMembershipId") REFERENCES "ContestMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_contestStockId_fkey" FOREIGN KEY ("contestStockId") REFERENCES "contest_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_contestId_roomNumber_fkey" FOREIGN KEY ("contestId", "roomNumber") REFERENCES "Room"("contestId", "roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHistory" ADD CONSTRAINT "StockHistory_roomContestId_roomNumber_fkey" FOREIGN KEY ("roomContestId", "roomNumber") REFERENCES "Room"("contestId", "roomNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
