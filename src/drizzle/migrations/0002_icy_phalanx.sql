ALTER TABLE "lessons" ALTER COLUMN "seconds" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "seconds" SET NOT NULL;