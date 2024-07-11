ALTER TABLE `parking_details` ADD `lot_number` text;--> statement-breakpoint
ALTER TABLE `price` ADD `auction_fee` integer;--> statement-breakpoint
ALTER TABLE `price` ADD `transaction_fee` integer;--> statement-breakpoint
ALTER TABLE `price` ADD `total_due` integer;