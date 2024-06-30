CREATE TABLE `note` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text,
	`car_id` integer,
	`note` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`car_id`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE cascade
);
