import { integer, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";

export const rolesTable = sqliteTable("roles", {
  id: integer("id").primaryKey(),
  roleName: text("role_name").notNull().unique(),
});

export const userTable = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  roleId: integer("role_id")
    .notNull()
    .references(() => rolesTable.id),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});

export const specificationsTable = sqliteTable('specifications', {
  id: integer('id').primaryKey(),
  vin: text('vin'),
  carfax: text('carfax'),
  year: text('year'),
  make: text('make'),
  model: text('model'),
  trim: text('trim'),
  manufacturer: text('manufacturer'),
  bodyType: text('body_type'),
  country: text('country'),
  engineType: text('engine_type'),
  titleNumber: text('title_number'),
  titleState: text('title_state'),
  color: text('color'),
  runndrive: text('runndrive'),
  fuelType: text('fuel_type'),
});

export const parkingDetailsTable = sqliteTable('parking_details', {
  id: integer('id').primaryKey(),
  fined:text('fined'),
  arrived: text('arrived'),
  status: text('status'),
  parkingDateString: text('parking_date_string'),
});

export const carTable = sqliteTable('car', {
  id: integer('id').primaryKey(),
  vin: text('vin'),
  originPort: text('origin_port'),
  destinationPort: text('destination_port'),
  departureDate: text('departure_date'),
  arrivalDate: text('arrival_date'),
  auction: text('auction'),
  createdAt: text('created_at'),
  shipping: text('shipping'),
  specificationsId: integer('specifications_id').references(() => specificationsTable.id),
  parkingDetailsId: integer('parking_details_id').references(() => parkingDetailsTable.id),
});

export const userCarTable = sqliteTable("user_car", {
  carId: integer("car_id"),
  userId: integer("user_id"),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.carId, table.userId] }),
  };
});
