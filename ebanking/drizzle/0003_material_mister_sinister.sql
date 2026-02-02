CREATE TYPE "public"."category" AS ENUM('FOOD', 'FUEL', 'RENT', 'BILLS', 'SHOPPING', 'ENTERTAINMENT', 'HEALTH', 'TRANSPORT', 'OTHER');--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "amount" TO "from_currency";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "to_currency" varchar(3) NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "amount_from" numeric(14, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "amount_to" numeric(14, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "category" "category" NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "exchange_rate_id" uuid;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balances" ADD CONSTRAINT "balances_account_id_accounts_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sender_id_accounts_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."accounts"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receiver_id_accounts_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."accounts"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_exchange_rate_id_exchange_rates_exchange_rate_id_fk" FOREIGN KEY ("exchange_rate_id") REFERENCES "public"."exchange_rates"("exchange_rate_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_rate_day_pair" ON "exchange_rates" USING btree ("rate_date","base_currency","quote_currency");