-- CreateTable
CREATE TABLE "reportHundler" (
    "id" SERIAL NOT NULL,
    "adminId" TEXT NOT NULL,
    "reportId" INTEGER NOT NULL,

    CONSTRAINT "reportHundler_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reportHundler" ADD CONSTRAINT "reportHundler_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportHundler" ADD CONSTRAINT "reportHundler_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
