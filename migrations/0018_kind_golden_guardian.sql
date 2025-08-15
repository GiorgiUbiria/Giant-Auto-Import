CREATE TABLE `customer_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` text NOT NULL,
	`admin_id` text NOT NULL,
	`note` text NOT NULL,
	`is_important` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `customer_notes_customer_id_idx` ON `customer_notes` (`customer_id`);--> statement-breakpoint
CREATE INDEX `customer_notes_admin_id_idx` ON `customer_notes` (`admin_id`);--> statement-breakpoint
CREATE INDEX `customer_notes_created_at_idx` ON `customer_notes` (`created_at`);--> statement-breakpoint
CREATE INDEX `customer_notes_is_important_idx` ON `customer_notes` (`is_important`);