CREATE TABLE IF NOT EXISTS "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"studentId" varchar(10) NOT NULL,
	"photoUrl" text,
	"studentCardUrl" text,
	"studentCardKey" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "players_userId_unique" UNIQUE("userId"),
	CONSTRAINT "players_studentId_unique" UNIQUE("studentId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "playerStats" (
	"id" serial PRIMARY KEY NOT NULL,
	"playerId" integer NOT NULL,
	"traumaLevel" integer DEFAULT 0 NOT NULL,
	"memoryPoints" integer DEFAULT 100 NOT NULL,
	"trustScore" integer DEFAULT 50 NOT NULL,
	"hatredScore" integer DEFAULT 0 NOT NULL,
	"obsessionScore" integer DEFAULT 0 NOT NULL,
	"compassionScore" integer DEFAULT 50 NOT NULL,
	"mentalState" varchar(20) DEFAULT 'normal' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "playerStats_playerId_unique" UNIQUE("playerId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"fromPlayerId" integer NOT NULL,
	"toPlayerId" integer NOT NULL,
	"emotionType" varchar(20) NOT NULL,
	"intensity" integer DEFAULT 0 NOT NULL,
	"reason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memories" (
	"id" serial PRIMARY KEY NOT NULL,
	"playerId" integer NOT NULL,
	"content" text NOT NULL,
	"isTrue" boolean DEFAULT true NOT NULL,
	"loopCount" integer DEFAULT 0 NOT NULL,
	"discoveredAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"playerId" integer NOT NULL,
	"eventType" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"playerId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"notificationType" varchar(50) NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "personalizedContent" (
	"id" serial PRIMARY KEY NOT NULL,
	"playerId" integer NOT NULL,
	"contentType" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"traumaLevelAtGeneration" integer NOT NULL,
	"loopCountAtGeneration" integer NOT NULL,
	"isViewed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loopState" (
	"id" serial PRIMARY KEY NOT NULL,
	"loopCount" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"distortionLevel" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "playerStats" ADD CONSTRAINT "playerStats_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "emotions" ADD CONSTRAINT "emotions_fromPlayerId_players_id_fk" FOREIGN KEY ("fromPlayerId") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "emotions" ADD CONSTRAINT "emotions_toPlayerId_players_id_fk" FOREIGN KEY ("toPlayerId") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "personalizedContent" ADD CONSTRAINT "personalizedContent_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;