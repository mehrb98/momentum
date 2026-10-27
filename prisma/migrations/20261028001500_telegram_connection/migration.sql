CREATE TABLE "TelegramConnection" (
    "userId" TEXT NOT NULL,
    "botToken" VARCHAR(200) NOT NULL,
    "chatId" VARCHAR(40) NOT NULL,
    "botUsername" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramConnection_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "TelegramConnection" ADD CONSTRAINT "TelegramConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
