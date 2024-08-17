import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { PriceList } from "./types";
import { z } from "zod";

export const sessions = sqliteTable("sessions", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  passwordText: text("password_text"),
  deposit: integer("deposit").default(0),
  balance: integer("balance").default(0),
  priceList: text("price_list", { mode: "json" }).$type<PriceList[]>(),
  role: text("role", {
    enum: ["CUSTOMER", "MODERATOR", "ACCOUNTANT", "ADMIN"],
  }).notNull(),
}, (table) => {
  return {
    fullNameIdx: index("full_name_idx").on(table.fullName),
    emailIdx: uniqueIndex("email_idx").on(table.email),
    phoneIdx: uniqueIndex("phone_idx").on(table.phone),
  }
});

export const usersRelations = relations(users, ({ many }) => ({
  ownedCars: many(cars),
}));

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  phone: (schema) => schema.phone.regex(
    new RegExp(
      "\\+(9[976]\\d|8[987530]\\d|6[987]\\d|5[90]\\d|42\\d|3[875]\\d|2[98654321]\\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)(\\W*\\d){9,10}$"
    )
  ),
  deposit: (schema) => schema.deposit.gte(0),
  balance: (schema) => schema.balance.gte(0),
  fullName: (schema) => schema.fullName.regex(
    new RegExp("^[A-Za-z]+[\\s\\-'A-Za-z]+$")
  ),
  password: (schema) => schema.password.regex(
    new RegExp(
      "^(?=.*\d).{8,15}$"
    )
  ),
});
export const selectUserSchema = createSelectSchema(users);

export const cars = sqliteTable("cars", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").references(() => users.id),
  vin: text("vin").notNull().unique(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  holder: text("holder"),
  bookingNumber: text("booking_number"),
  containerNumber: text("container_number"),
  lotNumber: text("lot_number"),
  auctionLocation: text("auction_location"),
  trackingLink: text("tracking_link"),
  destinationPort: text("destination_port").default("Poti"),
  shippingFee: integer("shipping_fee"),
  purchaseFee: integer("purchase_fee").notNull(),
  totalFee: integer("total_fee"),
  arrivalDate: integer("arrival_date", { mode: "timestamp" }),
  departureDate: integer("departure_date", { mode: "timestamp" }),
  purchaseDate: integer("purchase_date", { mode: "timestamp" }).notNull(),
  auction: text("auction", {
    enum: ["Copart", "IAAI", "Other"],
  }).notNull(),
  originPort: text("origin_port", {
    enum: ["NJ", "TX", "GA", "CA"],
  }).notNull(),
  keys: text("keys", {
    enum: ["YES", "NO", "UNKNOWN"],
  }).notNull(),
  title: text("title", {
    enum: ["YES", "NO", "PENDING"],
  }).notNull(),
  shippingStatus: text("shipping_status", {
    enum: ["AUCTION", "INNER_TRANSIT", "WAREHOUSE", "LOADED", "SAILING", "DELIVERED"],
  }).notNull(),
  bodyType: text("body_type", {
    enum: ["SEDAN", "ATV", "SUV", "PICKUP", "BIKE"],
  }).notNull(),
  fuelType: text("fuel_type", {
    enum: ["DIESEL", "GASOLINE", "HYBRID_ELECTRIC", "OTHER"],
  }).notNull(),
}, (table) => {
  return {
    vinIdx: uniqueIndex("vin_idx").on(table.vin),
    ownerIdx: index("owner_idx").on(table.ownerId),
  }
});

export const carsRelations = relations(cars, ({ one }) => ({
  owner: one(users, {
    fields: [cars.ownerId],
    references: [users.id],
  }),
}));

export const insertCarSchema = createInsertSchema(cars, {
  departureDate: z.date().optional(),
  arrivalDate: z.date().optional(),
  purchaseDate: z.date(),
});
export const selectCarSchema = createSelectSchema(cars);

export const payments = sqliteTable("payments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  customerId: text("customer_id").notNull().references(() => users.id),
  paymentDate: integer("payment_date", { mode: "timestamp" }).notNull().default(sql`(CURRENT_DATE)`),
  memo: text("memo").notNull(),
  payee: text("payee").notNull(),
  receivedAmount: integer("received_amount").notNull(),
  usedAmount: integer("used_amount").notNull().default(0),
  paymentBalance: integer("payment_balance").notNull().default(0),
  paymentType: text("payment_type", {
    enum: ["WIRE", "CASH"],
  }).notNull(),
  paymentStatus: text("payment_status", {
    enum: ["COMPLETE", "ACTIVE", "CLOSED"],
  }).notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  customer: one(users, { fields: [payments.customerId], references: [users.id], relationName: "customer_payment" }),
}));

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);

export const paymentCars = sqliteTable("payment_cars", {
  paymentId: integer("payment_id").notNull().references(() => payments.id),
  carId: integer("car_id").notNull().references(() => cars.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.paymentId, table.carId] }),
  }
});

export const paymentCarsRelations = relations(paymentCars, ({ one }) => ({
  payment: one(payments, { fields: [paymentCars.paymentId], references: [payments.id], relationName: "payment_for_car" }),
  car: one(cars, { fields: [paymentCars.carId], references: [cars.id], relationName: "car_of_payment" }),
}));

export const insertPaymentCarSchema = createInsertSchema(paymentCars);
export const selectPaymentCarSchema = createSelectSchema(paymentCars);

export const images = sqliteTable("images", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  carVin: text("car_vin").references(() => cars.vin, {
    onDelete: "cascade",
  }).notNull(),
  imageType: text("image_type", {
    enum: ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERED"],
  }).notNull(),
  imageKey: text("image_key").notNull(),
  priority: integer("priority", { mode: "boolean" }),
}, (table) => {
  return {
    imageKeyIdx: uniqueIndex("image_key_idx").on(table.imageKey)
  }
});

export const insertImageSchema = createInsertSchema(images);
export const selectImageSchema = createSelectSchema(images);

export const logs = sqliteTable("logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  path: text("path").notNull(),
  level: text("level", {
    enum: ["INFO", "WARNING", "ERROR"]
  }).notNull(),
  description: text("description"),
});

export const insertLogSchema = createInsertSchema(logs);
export const selectLogSchema = createSelectSchema(logs);
