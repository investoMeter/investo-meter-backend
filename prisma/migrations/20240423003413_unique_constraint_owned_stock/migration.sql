/*
  Warnings:

  - A unique constraint covering the columns `[stockId,contestMembershipId]` on the table `OwnedStock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OwnedStock_stockId_contestMembershipId_key" ON "OwnedStock"("stockId", "contestMembershipId");
