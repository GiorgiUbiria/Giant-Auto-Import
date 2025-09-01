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

export const logs = sqliteTable("logs", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	user_id: text("user_id").notNull().references(() => users.id),
	path: text("path").notNull(),
	level: text("level").notNull(),
	description: text("description"),
});

export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey().notNull(),
	user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	expires_at: integer("expires_at").notNull(),
});

export const users = sqliteTable("users", {
	id: text("id").primaryKey().notNull(),
	full_name: text("full_name").notNull(),
	email: text("email").notNull(),
	phone: text("phone").notNull(),
	password: text("password").notNull(),
	password_text: text("password_text"),
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

export const csv_data_versions = sqliteTable("csv_data_versions", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	version_name: text("version_name").notNull(),
	csv_data: text("csv_data").notNull(),
	is_active: integer("is_active").default(false).notNull(),
	uploaded_by: text("uploaded_by").notNull().references(() => users.id),
	uploaded_at: integer("uploaded_at").default(sql`(unixepoch())`).notNull(),
	description: text("description"),
},
	(table) => {
		return {
			uploaded_by_idx: index("csv_data_versions_uploaded_by_idx").on(table.uploaded_by),
			is_active_idx: index("csv_data_versions_is_active_idx").on(table.is_active),
		}
	});

export const default_pricing_config = sqliteTable("default_pricing_config", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	ground_fee_adjustment: integer("ground_fee_adjustment").default(0).notNull(),
	pickup_surcharge: integer("pickup_surcharge").default(300).notNull(),
	service_fee: integer("service_fee").default(100).notNull(),
	hybrid_surcharge: integer("hybrid_surcharge").default(150).notNull(),
	is_active: integer("is_active").default(true).notNull(),
	updated_at: integer("updated_at").default(sql`(unixepoch())`).notNull(),
	ocean_rates: text("ocean_rates").default("[]").notNull(),
});

export const user_pricing_config = sqliteTable("user_pricing_config", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	ground_fee_adjustment: integer("ground_fee_adjustment").default(0).notNull(),
	pickup_surcharge: integer("pickup_surcharge").default(300).notNull(),
	service_fee: integer("service_fee").default(100).notNull(),
	hybrid_surcharge: integer("hybrid_surcharge").default(150).notNull(),
	is_active: integer("is_active").default(true).notNull(),
	created_at: integer("created_at").default(sql`(unixepoch())`).notNull(),
	updated_at: integer("updated_at").default(sql`(unixepoch())`).notNull(),
	ocean_rates: text("ocean_rates").default("[]").notNull(),
},
	(table) => {
		return {
			is_active_idx: index("user_pricing_config_is_active_idx").on(table.is_active),
			user_id_idx: index("user_pricing_config_user_id_idx").on(table.user_id),
		}
	});

export const ocean_shipping_rates = sqliteTable("ocean_shipping_rates", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	state: text("state").notNull(),
	shorthand: text("shorthand").notNull(),
	rate: integer("rate").notNull(),
	is_active: integer("is_active").default(true).notNull(),
	created_at: integer("created_at").default(sql`(unixepoch())`).notNull(),
	updated_at: integer("updated_at").default(sql`(unixepoch())`).notNull(),
},
	(table) => {
		return {
			is_active_idx: index("ocean_shipping_rates_is_active_idx").on(table.is_active),
			shorthand_idx: index("ocean_shipping_rates_shorthand_idx").on(table.shorthand),
			state_idx: index("ocean_shipping_rates_state_idx").on(table.state),
		}
	});

export const customer_notes = sqliteTable("customer_notes", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	customer_id: text("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	admin_id: text("admin_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	note: text("note").notNull(),
	is_important: integer("is_important").default(false).notNull(),
	created_at: integer("created_at").default(sql`(unixepoch())`).notNull(),
	updated_at: integer("updated_at").default(sql`(unixepoch())`).notNull(),
},
	(table) => {
		return {
			is_important_idx: index("customer_notes_is_important_idx").on(table.is_important),
			created_at_idx: index("customer_notes_created_at_idx").on(table.created_at),
			admin_id_idx: index("customer_notes_admin_id_idx").on(table.admin_id),
			customer_id_idx: index("customer_notes_customer_id_idx").on(table.customer_id),
		}
	});

export const images = sqliteTable("images", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	car_vin: text("car_vin").notNull().references(() => cars.vin, { onDelete: "cascade" }),
	image_type: text("image_type").notNull(),
	image_key: text("image_key").notNull(),
	priority: integer("priority"),
},
	(table) => {
		return {
			image_key_idx: uniqueIndex("image_key_idx").on(table.image_key),
		}
	});