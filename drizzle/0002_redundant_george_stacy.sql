ALTER TABLE "memories" ADD COLUMN "title" varchar(255) DEFAULT '기억' NOT NULL;
--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "isManipulated" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "credibility" integer DEFAULT 100 NOT NULL;