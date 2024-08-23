CREATE TABLE `cars` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text,
	`vin` text NOT NULL,
	`year` integer NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`color` text,
	`holder` text,
	`booking_number` text,
	`container_number` text,
	`lot_number` text,
	`tracking_link` text,
	`destination_port` text DEFAULT 'Poti',
	`shipping_fee` integer,
	`purchase_fee` integer NOT NULL,
	`total_fee` integer,
	`arrival_date` integer,
	`departure_date` integer,
	`purchase_date` integer NOT NULL,
	`created_at` integer DEFAULT (CURRENT_DATE),
	`auction` text NOT NULL,
	`origin_port` text NOT NULL,
	`keys` text NOT NULL,
	`title` text NOT NULL,
	`shipping_status` text NOT NULL,
	`body_type` text NOT NULL,
	`fuel_type` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`car_vin` text NOT NULL,
	`image_type` text NOT NULL,
	`image_key` text NOT NULL,
	`priority` integer,
	FOREIGN KEY (`car_vin`) REFERENCES `cars`(`vin`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`path` text NOT NULL,
	`level` text NOT NULL,
	`description` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payment_cars` (
	`payment_id` integer NOT NULL,
	`car_id` integer NOT NULL,
	PRIMARY KEY(`car_id`, `payment_id`),
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` text NOT NULL,
	`payment_date` integer DEFAULT (CURRENT_DATE) NOT NULL,
	`memo` text NOT NULL,
	`payee` text NOT NULL,
	`received_amount` integer NOT NULL,
	`used_amount` integer DEFAULT 0 NOT NULL,
	`payment_balance` integer DEFAULT 0 NOT NULL,
	`payment_type` text NOT NULL,
	`payment_status` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`custom_id` text DEFAULT '0000',
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`password` text NOT NULL,
	`password_text` text,
	`deposit` integer DEFAULT 0,
	`balance` integer DEFAULT 0,
	`price_list` text,
	`role` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cars_vin_unique` ON `cars` (`vin`);--> statement-breakpoint
CREATE UNIQUE INDEX `cars_booking_number_unique` ON `cars` (`booking_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `cars_lot_number_unique` ON `cars` (`lot_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `cars_tracking_link_unique` ON `cars` (`tracking_link`);--> statement-breakpoint
CREATE UNIQUE INDEX `vin_idx` ON `cars` (`vin`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `cars` (`owner_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `images_image_key_unique` ON `images` (`image_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `image_key_idx` ON `images` (`image_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE INDEX `full_name_idx` ON `users` (`full_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `phone_idx` ON `users` (`phone`);