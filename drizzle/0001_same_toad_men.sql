CREATE TABLE `batches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`enrollmentStatus` enum('open','closed','full') DEFAULT 'open',
	`capacity` int,
	`enrolled` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityInfo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`titleEn` varchar(255),
	`titleAr` varchar(255),
	`contentEn` text,
	`contentAr` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityInfo_id` PRIMARY KEY(`id`),
	CONSTRAINT `communityInfo_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`duration` varchar(100),
	`certification` varchar(255),
	`level` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`featured` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`eventDate` timestamp NOT NULL,
	`eventTime` varchar(50),
	`topic` varchar(255),
	`speaker` varchar(255),
	`location` varchar(255),
	`featured` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`bioEn` text,
	`bioAr` text,
	`credentials` text,
	`photoUrl` varchar(512),
	`role` enum('founder','admin','mentor') DEFAULT 'mentor',
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `teamMembers_id` PRIMARY KEY(`id`)
);
