CREATE TYPE "public"."account_type" AS ENUM('CHECKING', 'MULTY_CURRENCY');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "accounts" (
	"account_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" varchar(50) NOT NULL,
	"account_type" "account_type" NOT NULL,
	"status" varchar(20) NOT NULL,
	"opening_date" date NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "accounts_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "balances" (
	"balance_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"currency" varchar(3) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"account_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"transaction_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date DEFAULT now(),
	"description" varchar(255),
	"amount" numeric(14, 2) NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"birth_date" date NOT NULL,
	"gender" "gender" NOT NULL,
	"phone" varchar(30) NOT NULL,
	"address" varchar(255),
	"email" varchar(255) NOT NULL,
	"salt" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
