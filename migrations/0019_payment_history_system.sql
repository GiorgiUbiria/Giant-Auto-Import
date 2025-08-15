-- Add due information to cars table
ALTER TABLE `cars` ADD COLUMN `due_date` integer;
ALTER TABLE `cars` ADD COLUMN `payment_due` integer DEFAULT 0;
CREATE INDEX `cars_due_date_idx` ON `cars` (`due_date`);

-- Update payments table structure
ALTER TABLE `payments` ADD COLUMN `description` text NOT NULL DEFAULT '';
ALTER TABLE `payments` ADD COLUMN `note` text;
ALTER TABLE `payments` ADD COLUMN `amount` integer NOT NULL DEFAULT 0;
ALTER TABLE `payments` ADD COLUMN `check_number` text;
ALTER TABLE `payments` ADD COLUMN `invoice_generated` integer DEFAULT false NOT NULL;
ALTER TABLE `payments` ADD COLUMN `invoice_type` text CHECK (`invoice_type` IN ('SHIPPING', 'PURCHASE', 'TOTAL'));
ALTER TABLE `payments` ADD COLUMN `created_at` integer DEFAULT (unixepoch()) NOT NULL;
ALTER TABLE `payments` ADD COLUMN `updated_at` integer DEFAULT (unixepoch()) NOT NULL;

-- Update payment_type enum to include CHECK
-- Note: SQLite doesn't support ALTER TABLE for enum changes, so we'll handle this in the application

-- Add indexes for payments table
CREATE INDEX `payments_customer_id_idx` ON `payments` (`customer_id`);
CREATE INDEX `payments_payment_date_idx` ON `payments` (`payment_date`);
CREATE INDEX `payments_payment_status_idx` ON `payments` (`payment_status`);

-- Update payment_cars table structure
ALTER TABLE `payment_cars` ADD COLUMN `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL;
ALTER TABLE `payment_cars` ADD COLUMN `amount` integer NOT NULL DEFAULT 0;
ALTER TABLE `payment_cars` ADD COLUMN `created_at` integer DEFAULT (unixepoch()) NOT NULL;

-- Add indexes for payment_cars table
CREATE INDEX `payment_cars_payment_id_idx` ON `payment_cars` (`payment_id`);
CREATE INDEX `payment_cars_car_id_idx` ON `payment_cars` (`car_id`);

-- Remove old columns from payments table (after ensuring data migration)
-- ALTER TABLE `payments` DROP COLUMN `memo`;
-- ALTER TABLE `payments` DROP COLUMN `payee`;
-- ALTER TABLE `payments` DROP COLUMN `received_amount`;
-- ALTER TABLE `payments` DROP COLUMN `used_amount`;
-- ALTER TABLE `payments` DROP COLUMN `payment_balance`;
