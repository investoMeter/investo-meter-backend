/*
  Warnings:

  - The primary key for the `players` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `hashedRefreshToken` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `players` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `players` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `players` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "players_email_key";

-- DropIndex
DROP INDEX "players_username_key";

-- AlterTable
ALTER TABLE "players" DROP CONSTRAINT "players_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "hashedPassword",
DROP COLUMN "hashedRefreshToken",
DROP COLUMN "id",
DROP COLUMN "salt",
DROP COLUMN "updatedAt",
DROP COLUMN "username",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "hashedPassword" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "hashedRefreshToken" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "players_userId_key" ON "players"("userId");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
