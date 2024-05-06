-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "about" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
