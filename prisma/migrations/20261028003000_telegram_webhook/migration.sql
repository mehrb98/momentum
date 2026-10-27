ALTER TABLE "TelegramConnection" ADD COLUMN "webhookSecret" VARCHAR(64);

CREATE UNIQUE INDEX "TelegramConnection_webhookSecret_key" ON "TelegramConnection"("webhookSecret");
