CREATE TABLE `transaction` (
	`id` integer PRIMARY KEY NOT NULL,
	`price_id` integer,
	`user_id` text,
	`car_id` integer,
	`currency_id` integer,
	`amount` real,
	`payment_date` integer,
	FOREIGN KEY (`price_id`) REFERENCES `price`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`car_id`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`currency_id`) REFERENCES `price_currency`(`id`) ON UPDATE no action ON DELETE no action
);
