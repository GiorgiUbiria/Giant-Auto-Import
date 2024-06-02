CREATE TABLE `car` (
	`id` integer PRIMARY KEY NOT NULL,
	`vin` text,
	`origin_port` text,
	`destination_port` text,
	`departure_date` text,
	`arrival_date` text,
	`auction` text,
	`created_at` text,
	`shipping` text,
	`specifications_id` integer,
	`parking_details_id` integer,
	FOREIGN KEY (`specifications_id`) REFERENCES `specifications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parking_details_id`) REFERENCES `parking_details`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `parking_details` (
	`id` integer PRIMARY KEY NOT NULL,
	`fined` text,
	`arrived` text,
	`status` text,
	`parking_date_string` text
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
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `specifications` (
	`id` integer PRIMARY KEY NOT NULL,
	`vin` text,
	`carfax` text,
	`year` text,
	`make` text,
	`model` text,
	`trim` text,
	`manufacturer` text,
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
CREATE TABLE `user_car` (
	`car_id` integer,
	`user_id` integer,
	PRIMARY KEY(`car_id`, `user_id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`password` text NOT NULL,
	`role_id` integer NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_role_name_unique` ON `roles` (`role_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_phone_unique` ON `user` (`phone`);