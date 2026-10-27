ALTER TYPE "Status" RENAME TO "StatusEnum";

CREATE TABLE "Status" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "color" VARCHAR(20) NOT NULL,
    "closes" BOOLEAN NOT NULL DEFAULT false,
    "key" VARCHAR(40),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Status_userId_sortOrder_idx" ON "Status"("userId", "sortOrder");

ALTER TABLE "Status" ADD CONSTRAINT "Status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Status" ("id", "name", "color", "closes", "key", "sortOrder", "createdAt", "updatedAt", "userId")
SELECT 'st_todo_' || "id", 'To do', 'default', false, 'TODO', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, "id" FROM "User"
UNION ALL
SELECT 'st_prog_' || "id", 'In progress', 'warning', false, 'IN_PROGRESS', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, "id" FROM "User"
UNION ALL
SELECT 'st_done_' || "id", 'Done', 'success', true, 'DONE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, "id" FROM "User";

ALTER TABLE "Board" ADD COLUMN "statusId" TEXT;
ALTER TABLE "Task" ADD COLUMN "statusId" TEXT;

UPDATE "Board" SET "statusId" = 'st_todo_' || "userId" WHERE "status" = 'TODO'::"StatusEnum";
UPDATE "Board" SET "statusId" = 'st_prog_' || "userId" WHERE "status" = 'IN_PROGRESS'::"StatusEnum";
UPDATE "Board" SET "statusId" = 'st_done_' || "userId" WHERE "status" = 'DONE'::"StatusEnum";

UPDATE "Task" SET "statusId" = 'st_todo_' || "userId" WHERE "status" = 'TODO'::"StatusEnum";
UPDATE "Task" SET "statusId" = 'st_prog_' || "userId" WHERE "status" = 'IN_PROGRESS'::"StatusEnum";
UPDATE "Task" SET "statusId" = 'st_done_' || "userId" WHERE "status" = 'DONE'::"StatusEnum";

ALTER TABLE "Board" ALTER COLUMN "statusId" SET NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "statusId" SET NOT NULL;

ALTER TABLE "Board" DROP COLUMN "status";
ALTER TABLE "Task" DROP COLUMN "status";

ALTER TABLE "Board" ADD CONSTRAINT "Board_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Board_statusId_idx" ON "Board"("statusId");
CREATE INDEX "Task_statusId_idx" ON "Task"("statusId");

DROP TYPE "StatusEnum";
