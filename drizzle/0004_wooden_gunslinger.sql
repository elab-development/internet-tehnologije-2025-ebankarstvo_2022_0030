ALTER TABLE "transactions" DROP CONSTRAINT "transactions_sender_id_accounts_user_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_receiver_id_accounts_user_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sender_id_accounts_account_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."accounts"("account_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receiver_id_accounts_account_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."accounts"("account_id") ON DELETE restrict ON UPDATE no action;