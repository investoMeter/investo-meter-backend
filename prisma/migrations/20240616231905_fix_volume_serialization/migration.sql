/*
  Warnings:

  - You are about to alter the column `volume` on the `contest_stock_price` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `volume` on the `level_stock_price` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "contest_stock_price" ALTER COLUMN "volume" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "level_stock_price" ALTER COLUMN "volume" SET DATA TYPE INTEGER;
