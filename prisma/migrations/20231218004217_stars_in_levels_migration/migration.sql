/*
  Warnings:

  - You are about to drop the column `firstGoal` on the `levels` table. All the data in the column will be lost.
  - You are about to drop the column `secondGoal` on the `levels` table. All the data in the column will be lost.
  - You are about to drop the column `thirdGoal` on the `levels` table. All the data in the column will be lost.
  - Added the required column `firstStar` to the `levels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondStar` to the `levels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thirdStar` to the `levels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "levels" DROP COLUMN "firstGoal",
DROP COLUMN "secondGoal",
DROP COLUMN "thirdGoal",
ADD COLUMN     "firstStar" INTEGER NOT NULL,
ADD COLUMN     "secondStar" INTEGER NOT NULL,
ADD COLUMN     "thirdStar" INTEGER NOT NULL;
