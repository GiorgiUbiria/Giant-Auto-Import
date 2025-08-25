CREATE TABLE `note_attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note_id` integer NOT NULL,
	`file_name` text NOT NULL,
	`file_key` text NOT NULL,
	`file_size` integer NOT NULL,
	`file_type` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`uploaded_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `customer_notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `customer_notes` ADD `has_attachments` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `note_attachments_note_id_idx` ON `note_attachments` (`note_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `note_attachments_file_key_idx` ON `note_attachments` (`file_key`);--> statement-breakpoint
CREATE INDEX `note_attachments_uploaded_by_idx` ON `note_attachments` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `note_attachments_uploaded_at_idx` ON `note_attachments` (`uploaded_at`);--> statement-breakpoint
CREATE INDEX `customer_notes_has_attachments_idx` ON `customer_notes` (`has_attachments`);