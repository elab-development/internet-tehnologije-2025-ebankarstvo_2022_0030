ALTER TYPE "public"."user_status" ADD VALUE 'UNREGISTERED' BEFORE 'ENABLED';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "user_status" SET DEFAULT 'UNREGISTERED';