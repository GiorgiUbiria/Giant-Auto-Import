-- Create ocean_shipping_rates table if it doesn't exist
CREATE TABLE IF NOT EXISTS `ocean_shipping_rates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`state` text NOT NULL,
	`shorthand` text NOT NULL,
	`rate` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint

-- Add ocean_rates column to default_pricing_config if it doesn't exist
ALTER TABLE `default_pricing_config` ADD COLUMN IF NOT EXISTS `ocean_rates` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint

-- Add ocean_rates column to user_pricing_config if it doesn't exist
ALTER TABLE `user_pricing_config` ADD COLUMN IF NOT EXISTS `ocean_rates` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS `ocean_shipping_rates_state_idx` ON `ocean_shipping_rates` (`state`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ocean_shipping_rates_shorthand_idx` ON `ocean_shipping_rates` (`shorthand`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ocean_shipping_rates_is_active_idx` ON `ocean_shipping_rates` (`is_active`);
--> statement-breakpoint

-- Drop ocean_fee columns if they exist
ALTER TABLE `default_pricing_config` DROP COLUMN IF EXISTS `ocean_fee`;
--> statement-breakpoint
ALTER TABLE `user_pricing_config` DROP COLUMN IF EXISTS `ocean_fee`;