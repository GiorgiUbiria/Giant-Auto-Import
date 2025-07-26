import { sqliteTable, AnySQLiteColumn, index, uniqueIndex, foreignKey, integer, text, primaryKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const cars = sqliteTable("cars", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	owner_id: text("owner_id").references(() => users.id),
	vin: text("vin").notNull(),
	year: integer("year").notNull(),
	make: text("make").notNull(),
	model: text("model").notNull(),
	booking_number: text("booking_number"),
	container_number: text("container_number"),
	lot_number: text("lot_number"),
	tracking_link: text("tracking_link"),
	destination_port: text("destination_port").default("Poti"),
	shipping_fee: integer("shipping_fee"),
	purchase_fee: integer("purchase_fee").notNull(),
	total_fee: integer("total_fee"),
	arrival_date: integer("arrival_date"),
	departure_date: integer("departure_date"),
	purchase_date: integer("purchase_date").notNull(),
	auction: text("auction").notNull(),
	origin_port: text("origin_port").notNull(),
	keys: text("keys").notNull(),
	title: text("title").notNull(),
	shipping_status: text("shipping_status").notNull(),
	body_type: text("body_type").notNull(),
	fuel_type: text("fuel_type").notNull(),
	auction_location: text("auction_location"),
	reciever: text("reciever"),
	ground_fee: integer("ground_fee"),
	virtual_bid_fee: integer("virtual_bid_fee"),
	auction_fee: integer("auction_fee"),
	gate_fee: integer("gate_fee"),
	title_fee: integer("title_fee"),
	environmental_fee: integer("environmental_fee"),
	ocean_fee: integer("ocean_fee"),
	insurance: text("insurance").notNull(),
},
(table) => {
	return {
		purchase_date_idx: index("purchase_date_idx").on(table.purchase_date),
		owner_idx: index("owner_idx").on(table.owner_id),
		vin_idx: uniqueIndex("vin_idx").on(table.vin),
		vin_unique: uniqueIndex("cars_vin_unique").on(table.vin),
	}
});

export const images = sqliteTable("images", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	car_vin: text("car_vin").notNull().references(() => cars.vin, { onDelete: "cascade" } ),
	image_type: text("image_type").notNull(),
	image_key: text("image_key").notNull(),
	priority: integer("priority"),
},
(table) => {
	return {
		image_key_idx: uniqueIndex("image_key_idx").on(table.image_key),
	}
});

export const logs = sqliteTable("logs", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	user_id: text("user_id").notNull().references(() => users.id),
	path: text("path").notNull(),
	level: text("level").notNull(),
	description: text("description"),
});

export const payment_cars = sqliteTable("payment_cars", {
	payment_id: integer("payment_id").notNull().references(() => payments.id),
	car_id: integer("car_id").notNull().references(() => cars.id),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.car_id, table.payment_id], name: "payment_cars_car_id_payment_id_pk"})
	}
});

export const payments = sqliteTable("payments", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	customer_id: text("customer_id").notNull().references(() => users.id),
	payment_date: integer("payment_date").default(sql`(CURRENT_DATE)`).notNull(),
	memo: text("memo").notNull(),
	payee: text("payee").notNull(),
	received_amount: integer("received_amount").notNull(),
	used_amount: integer("used_amount").default(0).notNull(),
	payment_balance: integer("payment_balance").default(0).notNull(),
	payment_type: text("payment_type").notNull(),
	payment_status: text("payment_status").notNull(),
});

export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey().notNull(),
	user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	expires_at: integer("expires_at").notNull(),
});

export const users = sqliteTable("users", {
	id: text("id").primaryKey().notNull(),
	full_name: text("full_name").notNull(),
	email: text("email").notNull(),
	phone: text("phone").notNull(),
	password: text("password").notNull(),
	password_text: text("password_text"),
	deposit: integer("deposit").default(0),
	balance: integer("balance").default(0),
	price_list: text("price_list"),
	role: text("role").notNull(),
},
(table) => {
	return {
		phone_idx: uniqueIndex("phone_idx").on(table.phone),
		email_idx: uniqueIndex("email_idx").on(table.email),
		full_name_idx: index("full_name_idx").on(table.full_name),
		phone_unique: uniqueIndex("users_phone_unique").on(table.phone),
		email_unique: uniqueIndex("users_email_unique").on(table.email),
	}
});