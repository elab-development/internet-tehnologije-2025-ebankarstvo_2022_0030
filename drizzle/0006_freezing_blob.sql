CREATE TYPE "public"."user_status" AS ENUM('ENABLED', 'DISABLED');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "user_status" "user_status" DEFAULT 'ENABLED' NOT NULL;