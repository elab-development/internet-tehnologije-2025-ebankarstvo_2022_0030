CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "sender_id" TO "sender_account_id";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "receiver_id" TO "receiver_account_id";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_sender_id_accounts_account_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_receiver_id_accounts_account_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role" DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sender_account_id_accounts_account_id_fk" FOREIGN KEY ("sender_account_id") REFERENCES "public"."accounts"("account_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receiver_account_id_accounts_account_id_fk" FOREIGN KEY ("receiver_account_id") REFERENCES "public"."accounts"("account_id") ON DELETE restrict ON UPDATE no action;