-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" TEXT DEFAULT 'customer',
ADD COLUMN "banned" BOOLEAN DEFAULT false,
ADD COLUMN "banReason" TEXT,
ADD COLUMN "banExpires" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Session" ADD COLUMN "impersonatedBy" TEXT;
