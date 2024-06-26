/*
  Warnings:

  - You are about to drop the `Contest_ContestStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contest_stock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contest_stock_price` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `level_stock_price` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `level_stocks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `levels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `players` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tutorials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BuyRequest" DROP CONSTRAINT "BuyRequest_contestId_stockId_fkey";

-- DropForeignKey
ALTER TABLE "BuyRequest" DROP CONSTRAINT "BuyRequest_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_tutorialId_fkey";

-- DropForeignKey
ALTER TABLE "Contest" DROP CONSTRAINT "Contest_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "ContestMembership" DROP CONSTRAINT "ContestMembership_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Contest_ContestStock" DROP CONSTRAINT "Contest_ContestStock_contestId_fkey";

-- DropForeignKey
ALTER TABLE "Contest_ContestStock" DROP CONSTRAINT "Contest_ContestStock_contestStockId_fkey";

-- DropForeignKey
ALTER TABLE "LevelMembership" DROP CONSTRAINT "LevelMembership_levelId_fkey";

-- DropForeignKey
ALTER TABLE "LevelMembership" DROP CONSTRAINT "LevelMembership_playerId_fkey";

-- DropForeignKey
ALTER TABLE "LevelQuestion" DROP CONSTRAINT "LevelQuestion_levelId_fkey";

-- DropForeignKey
ALTER TABLE "OwnedStock" DROP CONSTRAINT "OwnedStock_contestId_stockId_fkey";

-- DropForeignKey
ALTER TABLE "SellRequest" DROP CONSTRAINT "SellRequest_contestId_stockId_fkey";

-- DropForeignKey
ALTER TABLE "SellRequest" DROP CONSTRAINT "SellRequest_playerId_fkey";

-- DropForeignKey
ALTER TABLE "StockHistory" DROP CONSTRAINT "StockHistory_contestId_stockId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_contestId_stockId_fkey";

-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_userId_fkey";

-- DropForeignKey
ALTER TABLE "contest_stock" DROP CONSTRAINT "contest_stock_initialPriceId_fkey";

-- DropForeignKey
ALTER TABLE "contest_stock_price" DROP CONSTRAINT "contest_stock_price_stockHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_playerId_fkey";

-- DropForeignKey
ALTER TABLE "level_stock_price" DROP CONSTRAINT "level_stock_price_levelStockId_fkey";

-- DropForeignKey
ALTER TABLE "level_stocks" DROP CONSTRAINT "level_stocks_questionId_fkey";

-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_userId_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_adminId_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "tutorials" DROP CONSTRAINT "tutorials_levelId_fkey";

-- DropIndex
DROP INDEX "Room_contestId_roomNumber_key";

-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Contest_ContestStock";

-- DropTable
DROP TABLE "admins";

-- DropTable
DROP TABLE "contest_stock";

-- DropTable
DROP TABLE "contest_stock_price";

-- DropTable
DROP TABLE "level_stock_price";

-- DropTable
DROP TABLE "level_stocks";

-- DropTable
DROP TABLE "levels";

-- DropTable
DROP TABLE "players";

-- DropTable
DROP TABLE "report";

-- DropTable
DROP TABLE "tutorials";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMembership" (
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityMembership_pkey" PRIMARY KEY ("userId","communityId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "adminId" TEXT,
    "creatorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "state" "ReportState" NOT NULL,
    "severity" "ReportSeverity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Player" (
    "userId" TEXT NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "salt" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "hashedRefreshToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestContestStock" (
    "contestId" INTEGER NOT NULL,
    "contestStockId" INTEGER NOT NULL,

    CONSTRAINT "ContestContestStock_pkey" PRIMARY KEY ("contestId","contestStockId")
);

-- CreateTable
CREATE TABLE "ContestStockPrice" (
    "id" SERIAL NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "highest" DOUBLE PRECISION NOT NULL,
    "lowest" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stockHistoryId" INTEGER,

    CONSTRAINT "ContestStockPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestStock" (
    "id" SERIAL NOT NULL,
    "initialPriceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "ContestStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelStockPrice" (
    "id" SERIAL NOT NULL,
    "levelStockId" INTEGER NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "highest" DOUBLE PRECISION NOT NULL,
    "lowest" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LevelStockPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelStock" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "LevelStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "patternName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tutorial" (
    "id" SERIAL NOT NULL,
    "levelId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "imageStorageId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Tutorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Community_ownerId_key" ON "Community"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_userId_key" ON "Player"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_username_idx" ON "User"("id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "ContestStock_initialPriceId_key" ON "ContestStock"("initialPriceId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestStock_symbol_key" ON "ContestStock"("symbol");

-- CreateIndex
CREATE INDEX "symbol" ON "ContestStock"("symbol");

-- CreateIndex
CREATE INDEX "level_stock_price_level_stock_id_idx" ON "LevelStockPrice"("levelStockId");

-- CreateIndex
CREATE UNIQUE INDEX "LevelStock_questionId_key" ON "LevelStock"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Level_number_key" ON "Level"("number");

-- CreateIndex
CREATE INDEX "Level_number_idx" ON "Level"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Tutorial_levelId_key" ON "Tutorial"("levelId");

-- CreateIndex
CREATE INDEX "levelId" ON "Tutorial"("levelId");

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Player"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMembership" ADD CONSTRAINT "CommunityMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Player"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMembership" ADD CONSTRAINT "CommunityMembership_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_communityId_fkey" FOREIGN KEY ("userId", "communityId") REFERENCES "CommunityMembership"("userId", "communityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_communityId_fkey" FOREIGN KEY ("authorId", "communityId") REFERENCES "CommunityMembership"("userId", "communityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Player"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_contestId_stockId_fkey" FOREIGN KEY ("contestId", "stockId") REFERENCES "ContestContestStock"("contestId", "contestStockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestContestStock" ADD CONSTRAINT "ContestContestStock_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestContestStock" ADD CONSTRAINT "ContestContestStock_contestStockId_fkey" FOREIGN KEY ("contestStockId") REFERENCES "ContestStock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestMembership" ADD CONSTRAINT "ContestMembership_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestStockPrice" ADD CONSTRAINT "ContestStockPrice_stockHistoryId_fkey" FOREIGN KEY ("stockHistoryId") REFERENCES "StockHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestStock" ADD CONSTRAINT "ContestStock_initialPriceId_fkey" FOREIGN KEY ("initialPriceId") REFERENCES "ContestStockPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedStock" ADD CONSTRAINT "OwnedStock_contestId_stockId_fkey" FOREIGN KEY ("contestId", "stockId") REFERENCES "ContestContestStock"("contestId", "contestStockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_contestId_stockId_fkey" FOREIGN KEY ("contestId", "stockId") REFERENCES "ContestContestStock"("contestId", "contestStockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHistory" ADD CONSTRAINT "StockHistory_contestId_stockId_fkey" FOREIGN KEY ("contestId", "stockId") REFERENCES "ContestContestStock"("contestId", "contestStockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_contestId_stockId_fkey" FOREIGN KEY ("contestId", "stockId") REFERENCES "ContestContestStock"("contestId", "contestStockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelMembership" ADD CONSTRAINT "LevelMembership_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelMembership" ADD CONSTRAINT "LevelMembership_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelQuestion" ADD CONSTRAINT "LevelQuestion_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelStockPrice" ADD CONSTRAINT "LevelStockPrice_levelStockId_fkey" FOREIGN KEY ("levelStockId") REFERENCES "LevelStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelStock" ADD CONSTRAINT "LevelStock_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "LevelQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
