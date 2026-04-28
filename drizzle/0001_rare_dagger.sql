CREATE TABLE `emotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromPlayerId` int NOT NULL,
	`toPlayerId` int NOT NULL,
	`emotionType` varchar(20) NOT NULL,
	`intensity` int NOT NULL DEFAULT 0,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emotions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`eventType` varchar(50) NOT NULL,
	`description` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loopState` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loopCount` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`distortionLevel` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loopState_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`content` text NOT NULL,
	`isTrue` boolean NOT NULL DEFAULT true,
	`loopCount` int NOT NULL DEFAULT 0,
	`discoveredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `memories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`notificationType` varchar(50) NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personalizedContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`contentType` varchar(50) NOT NULL,
	`content` text NOT NULL,
	`traumaLevelAtGeneration` int NOT NULL,
	`loopCountAtGeneration` int NOT NULL,
	`isViewed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `personalizedContent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playerStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`traumaLevel` int NOT NULL DEFAULT 0,
	`memoryPoints` int NOT NULL DEFAULT 100,
	`trustScore` int NOT NULL DEFAULT 50,
	`hatredScore` int NOT NULL DEFAULT 0,
	`obsessionScore` int NOT NULL DEFAULT 0,
	`compassionScore` int NOT NULL DEFAULT 50,
	`mentalState` varchar(20) NOT NULL DEFAULT 'normal',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playerStats_id` PRIMARY KEY(`id`),
	CONSTRAINT `playerStats_playerId_unique` UNIQUE(`playerId`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` varchar(10) NOT NULL,
	`photoUrl` text,
	`studentCardUrl` text,
	`studentCardKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `players_id` PRIMARY KEY(`id`),
	CONSTRAINT `players_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `players_studentId_unique` UNIQUE(`studentId`)
);
--> statement-breakpoint
ALTER TABLE `emotions` ADD CONSTRAINT `emotions_fromPlayerId_players_id_fk` FOREIGN KEY (`fromPlayerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emotions` ADD CONSTRAINT `emotions_toPlayerId_players_id_fk` FOREIGN KEY (`toPlayerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memories` ADD CONSTRAINT `memories_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personalizedContent` ADD CONSTRAINT `personalizedContent_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playerStats` ADD CONSTRAINT `playerStats_playerId_players_id_fk` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `players` ADD CONSTRAINT `players_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;