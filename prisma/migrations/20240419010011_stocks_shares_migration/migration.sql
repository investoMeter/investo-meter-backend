/*
  Warnings:

  - Added the required column `startingShares` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentShares` to the `StockHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "startingShares" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StockHistory" ADD COLUMN     "currentShares" INTEGER NOT NULL;
