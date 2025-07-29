import { relations } from "drizzle-orm/relations";
import { users, cars, images, logs, payment_cars, payments, sessions, csv_data_versions, user_pricing_config } from "./schema";

export const carsRelations = relations(cars, ({one, many}) => ({
	user: one(users, {
		fields: [cars.owner_id],
		references: [users.id]
	}),
	images: many(images),
	payment_cars: many(payment_cars),
}));

export const usersRelations = relations(users, ({many}) => ({
	cars: many(cars),
	logs: many(logs),
	payments: many(payments),
	sessions: many(sessions),
	csv_data_versions: many(csv_data_versions),
	user_pricing_configs: many(user_pricing_config),
}));

export const imagesRelations = relations(images, ({one}) => ({
	car: one(cars, {
		fields: [images.car_vin],
		references: [cars.vin]
	}),
}));

export const logsRelations = relations(logs, ({one}) => ({
	user: one(users, {
		fields: [logs.user_id],
		references: [users.id]
	}),
}));

export const payment_carsRelations = relations(payment_cars, ({one}) => ({
	car: one(cars, {
		fields: [payment_cars.car_id],
		references: [cars.id]
	}),
	payment: one(payments, {
		fields: [payment_cars.payment_id],
		references: [payments.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one, many}) => ({
	payment_cars: many(payment_cars),
	user: one(users, {
		fields: [payments.customer_id],
		references: [users.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.user_id],
		references: [users.id]
	}),
}));

export const csv_data_versionsRelations = relations(csv_data_versions, ({one}) => ({
	user: one(users, {
		fields: [csv_data_versions.uploaded_by],
		references: [users.id]
	}),
}));

export const user_pricing_configRelations = relations(user_pricing_config, ({one}) => ({
	user: one(users, {
		fields: [user_pricing_config.user_id],
		references: [users.id]
	}),
}));