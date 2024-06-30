import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  primaryKey,
  real,
} from "drizzle-orm/sqlite-core";

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
    .references(() => rolesTable.id, { onDelete: "cascade" }),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
});

export const specificationsTable = sqliteTable("specifications", {
  id: integer("id").primaryKey(),
  vin: text("vin"),
  carfax: text("carfax"),
  year: text("year"),
  make: text("make"),
  model: text("model"),
  trim: text("trim"),
  manufacturer: text("manufacturer"),
  bodyType: text("body_type"),
  country: text("country"),
  engineType: text("engine_type"),
  titleNumber: text("title_number"),
  titleState: text("title_state"),
  color: text("color"),
  runndrive: text("runndrive"),
  fuelType: text("fuel_type"),
});

export const parkingDetailsTable = sqliteTable("parking_details", {
  id: integer("id").primaryKey(),
  fined: integer("fined", { mode: "boolean" }),
  arrived: integer("arrived", { mode: "boolean" }),
  status: text("status", {
    enum: ["Pending", "OnHand", "Loaded", "InTransit", "Fault"],
  }),
  parkingDateString: text("parking_date_string"),
});

export const carTable = sqliteTable("car", {
  id: integer("id").primaryKey(),
  vin: text("vin").unique(),
  originPort: text("origin_port"),
  destinationPort: text("destination_port"),
  departureDate: integer("departure_date", { mode: "timestamp" }),
  arrivalDate: integer("arrival_date", { mode: "timestamp" }),
  auction: text("auction"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  shipping: text("shipping"),
  specificationsId: integer("specifications_id").references(
    () => specificationsTable.id,
    { onDelete: "cascade" },
  ),
  parkingDetailsId: integer("parking_details_id").references(
    () => parkingDetailsTable.id,
    { onDelete: "cascade" },
  ),
});

export const imageTable = sqliteTable("image", {
  id: integer("id").primaryKey(),
  carVin: text("car_vin").references(() => carTable.vin, {
    onDelete: "cascade",
  }),
  imageUrl: text("image_url"),
  imageType: text("image_type"),
});

export const userCarTable = sqliteTable(
  "user_car",
  {
    carId: integer("car_id").references(() => carTable.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.carId, table.userId] }),
    };
  },
);

export const priceTable = sqliteTable("price", {
  id: integer("id").primaryKey(),
  totalAmount: real("total_amount"),
  amountLeft: real("amount_left"),
  currencyId: integer("currency_id").references(() => priceCurrencyTable.id),
  carId: integer("car_id").references(() => carTable.id, {
    onDelete: "cascade",
  }),
});

export const priceCurrencyTable = sqliteTable("price_currency", {
  id: integer("id").primaryKey(),
  currencyCode: text("currency_code").notNull().unique(),
});

export const transactionTable = sqliteTable("transaction", {
  id: integer("id").primaryKey(),
  priceId: integer("price_id").references(() => priceTable.id, {
    onDelete: "cascade",
  }),
  userId: text("user_id").references(() => userTable.id, {
    onDelete: "cascade",
  }),
  carId: integer("car_id").references(() => carTable.id, {
    onDelete: "cascade",
  }),
  currencyId: integer("currency_id").references(() => priceCurrencyTable.id),
  amount: real("amount"),
  paymentDate: integer("payment_date", { mode: "timestamp" }),
});
