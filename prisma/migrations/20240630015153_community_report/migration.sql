/*
  Warnings:

  - Added the required column `subjectId` to the `CommunityReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CommunityReport" ADD COLUMN     "subjectId" TEXT NOT NULL;
