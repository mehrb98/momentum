-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "status" "Status" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "boardId" TEXT;

-- CreateIndex
CREATE INDEX "Board_userId_sortOrder_idx" ON "Board"("userId", "sortOrder");

-- CreateIndex
CREATE INDEX "Task_boardId_idx" ON "Task"("boardId");

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;
