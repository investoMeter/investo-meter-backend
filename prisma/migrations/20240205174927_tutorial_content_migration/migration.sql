/*
  Warnings:

  - You are about to drop the column `authorId` on the `tutorials` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tutorials` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tutorials" DROP CONSTRAINT "tutorials_authorId_fkey";

-- DropIndex
DROP INDEX "authorId";

-- AlterTable
ALTER TABLE "tutorials" DROP COLUMN "authorId",
DROP COLUMN "description";

-- CreateTable
CREATE TABLE "Content" (
    "id" SERIAL NOT NULL,
    "subTitle" TEXT NOT NULL,
    "description" TEXT[],
    "tutorialId" INTEGER NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "tutorials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
