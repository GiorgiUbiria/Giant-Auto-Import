import { relations } from "drizzle-orm/relations";
import { users, cars, logs, sessions, csv_data_versions, user_pricing_config, customer_notes, images } from "./schema";

export const carsRelations = relations(cars, ({ one, many }) => ({
	user: one(users, {
		fields: [cars.owner_id],
		references: [users.id]
	}),
	images: many(images),
}));

export const usersRelations = relations(users, ({ many }) => ({
	cars: many(cars),
	logs: many(logs),
	sessions: many(sessions),
	csv_data_versions: many(csv_data_versions),
	user_pricing_configs: many(user_pricing_config),
	customer_notes_admin_id: many(customer_notes, {
		relationName: "customer_notes_admin_id_users_id"
	}),
	customer_notes_customer_id: many(customer_notes, {
		relationName: "customer_notes_customer_id_users_id"
	}),
}));

export const logsRelations = relations(logs, ({ one }) => ({
	user: one(users, {
		fields: [logs.user_id],
		references: [users.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.user_id],
		references: [users.id]
	}),
}));

export const csv_data_versionsRelations = relations(csv_data_versions, ({ one }) => ({
	user: one(users, {
		fields: [csv_data_versions.uploaded_by],
		references: [users.id]
	}),
}));

export const user_pricing_configRelations = relations(user_pricing_config, ({ one }) => ({
	user: one(users, {
		fields: [user_pricing_config.user_id],
		references: [users.id]
	}),
}));

export const customer_notesRelations = relations(customer_notes, ({ one }) => ({
	user_admin_id: one(users, {
		fields: [customer_notes.admin_id],
		references: [users.id],
		relationName: "customer_notes_admin_id_users_id"
	}),
	user_customer_id: one(users, {
		fields: [customer_notes.customer_id],
		references: [users.id],
		relationName: "customer_notes_customer_id_users_id"
	}),
}));

export const imagesRelations = relations(images, ({ one }) => ({
	car: one(cars, {
		fields: [images.car_vin],
		references: [cars.vin]
	}),
}));