ALTER TABLE `memories` ADD `title` varchar(255) DEFAULT '기억' NOT NULL;--> statement-breakpoint
ALTER TABLE `memories` ADD `isManipulated` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `memories` ADD `credibility` int DEFAULT 100 NOT NULL;