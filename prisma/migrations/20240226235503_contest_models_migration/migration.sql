/*
  Warnings:

  - You are about to drop the column `closePrice` on the `contest_stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `contest_stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `highestPrice` on the `contest_stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `lowestPrice` on the `contest_stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `openPrice` on the `contest_stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `contest_stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `closePrice` on the `level_stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `level_stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `highestPrice` on the `level_stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `lowestPrice` on the `level_stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `openPrice` on the `level_stock_price` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `level_stock_price` table. All the data in the column will be lost.
  - Added the required column `close` to the `contest_stock_price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `highest` to the `contest_stock_price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lowest` to the `contest_stock_price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `open` to the `contest_stock_price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `close` to the `level_stock_price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `highest` to the `level_stock_price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lowest` to the `level_stock_price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `open` to the `level_stock_price` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contest_stock_price" DROP COLUMN "closePrice",
DROP COLUMN "createdAt",
DROP COLUMN "highestPrice",
DROP COLUMN "lowestPrice",
DROP COLUMN "openPrice",
DROP COLUMN "updatedAt",
ADD COLUMN     "close" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "highest" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lowest" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "open" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "timeStamp" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "level_stock_price" DROP COLUMN "closePrice",
DROP COLUMN "createdAt",
DROP COLUMN "highestPrice",
DROP COLUMN "lowestPrice",
DROP COLUMN "openPrice",
DROP COLUMN "updatedAt",
ADD COLUMN     "close" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "highest" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lowest" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "open" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "timeStamp" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "coinsCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ContestMembership" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "currentMoneyAmount" INTEGER NOT NULL DEFAULT 0,
    "playerId" TEXT NOT NULL,
    "contestId" INTEGER NOT NULL,

    CONSTRAINT "ContestMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rooms" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "type" "TradeType" NOT NULL,
    "stockCount" INTEGER NOT NULL DEFAULT 1,
    "stockId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContestMembership_contestId_playerId_key" ON "ContestMembership"("contestId", "playerId");

-- AddForeignKey
ALTER TABLE "ContestMembership" ADD CONSTRAINT "ContestMembership_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestMembership" ADD CONSTRAINT "ContestMembership_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "contest_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ContestMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
