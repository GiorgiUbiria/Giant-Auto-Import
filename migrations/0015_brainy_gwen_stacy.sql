CREATE TABLE `csv_data_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`version_name` text NOT NULL,
	`csv_data` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`uploaded_by` text NOT NULL,
	`uploaded_at` integer DEFAULT (unixepoch()) NOT NULL,
	`description` text,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `default_pricing_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ocean_fee` integer DEFAULT 1025 NOT NULL,
	`ground_fee_adjustment` integer DEFAULT 0 NOT NULL,
	`pickup_surcharge` integer DEFAULT 300 NOT NULL,
	`service_fee` integer DEFAULT 100 NOT NULL,
	`hybrid_surcharge` integer DEFAULT 150 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_pricing_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`ocean_fee` integer DEFAULT 1025 NOT NULL,
	`ground_fee_adjustment` integer DEFAULT 0 NOT NULL,
	`pickup_surcharge` integer DEFAULT 300 NOT NULL,
	`service_fee` integer DEFAULT 100 NOT NULL,
	`hybrid_surcharge` integer DEFAULT 150 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP INDEX IF EXISTS `owner_purchase_date_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `auction_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `shipping_status_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `make_model_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `year_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `lot_number_idx`;--> statement-breakpoint
CREATE INDEX `csv_data_versions_is_active_idx` ON `csv_data_versions` (`is_active`);--> statement-breakpoint
CREATE INDEX `csv_data_versions_uploaded_by_idx` ON `csv_data_versions` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `user_pricing_config_user_id_idx` ON `user_pricing_config` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_pricing_config_is_active_idx` ON `user_pricing_config` (`is_active`);