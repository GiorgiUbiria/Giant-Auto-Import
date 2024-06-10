CREATE TABLE `price_currency` (
	`id` integer PRIMARY KEY NOT NULL,
	`currency_code` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `price` (
	`id` integer PRIMARY KEY NOT NULL,
	`amount` real,
	`currency_id` integer,
	`car_id` integer,
	`user_id` integer,
	`payment_date` text,
	FOREIGN KEY (`currency_id`) REFERENCES `price_currency`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`car_id`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` integer PRIMARY KEY NOT NULL,
	`price_id` integer,
	`user_id` integer,
	`car_id` integer,
	`payment_date` text,
	FOREIGN KEY (`price_id`) REFERENCES `price`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`car_id`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `price_currency_currency_code_unique` ON `price_currency` (`currency_code`);