CREATE TABLE `car` (
	`id` integer PRIMARY KEY NOT NULL,
	`vin` text,
	`origin_port` text,
	`destination_port` text,
	`departure_date` integer,
	`arrival_date` integer,
	`auction` text,
	`created_at` integer,
	`shipping` text,
	`specifications_id` integer,
	`parking_details_id` integer,
	FOREIGN KEY (`specifications_id`) REFERENCES `specifications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parking_details_id`) REFERENCES `parking_details`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `image` (
	`id` integer PRIMARY KEY NOT NULL,
	`car_vin` text,
	`image_url` text,
	`image_type` text,
	FOREIGN KEY (`car_vin`) REFERENCES `car`(`vin`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `note` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text,
	`car_id` integer,
	`note` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`car_id`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `parking_details` (
	`id` integer PRIMARY KEY NOT NULL,
	`fined` integer,
	`arrived` integer,
	`status` text
);
--> statement-breakpoint
CREATE TABLE `price` (
	`id` integer PRIMARY KEY NOT NULL,
	`total_amount` real,
	`amount_left` real,
	`car_id` integer,
	FOREIGN KEY (`car_id`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY NOT NULL,
	`role_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `specifications` (
	`id` integer PRIMARY KEY NOT NULL,
	`vin` text,
	`carfax` text,
	`year` text,
	`make` text,
	`model` text,
	`body_type` text,
	`country` text,
	`engine_type` text,
	`title_number` text,
	`title_state` text,
	`color` text,
	`runndrive` text,
	`fuel_type` text
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` integer PRIMARY KEY NOT NULL,
	`price_id` integer,
	`user_id` text,
	`car_id` integer,
	`amount` real,
	`payment_date` integer,
	FOREIGN KEY (`price_id`) REFERENCES `price`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`car_id`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_car` (
	`car_id` integer,
	`user_id` text,
	PRIMARY KEY(`car_id`, `user_id`),
	FOREIGN KEY (`car_id`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`password` text NOT NULL,
	`role_id` integer NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_vin_unique` ON `car` (`vin`);--> statement-breakpoint
CREATE UNIQUE INDEX `roles_role_name_unique` ON `roles` (`role_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_phone_unique` ON `user` (`phone`);