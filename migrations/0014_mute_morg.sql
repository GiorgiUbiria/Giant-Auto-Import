CREATE INDEX `owner_purchase_date_idx` ON `cars` (`owner_id`,`purchase_date`);--> statement-breakpoint
CREATE INDEX `auction_idx` ON `cars` (`auction`);--> statement-breakpoint
CREATE INDEX `shipping_status_idx` ON `cars` (`shipping_status`);--> statement-breakpoint
CREATE INDEX `make_model_idx` ON `cars` (`make`,`model`);--> statement-breakpoint
CREATE INDEX `year_idx` ON `cars` (`year`);--> statement-breakpoint
CREATE INDEX `lot_number_idx` ON `cars` (`lot_number`);