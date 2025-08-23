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

import { z } from "zod";
import { PriceList } from "./types";

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
  priceList: text("price_list", { mode: "json" }).$type<PriceList[]>(),
  role: text("role", {
    enum: ["CUSTOMER_SINGULAR", "CUSTOMER_DEALER", "MODERATOR", "ACCOUNTANT", "ADMIN"],
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
  userPricingConfig: many(userPricingConfig),
  csvUploads: many(csvDataVersions),
  customerNotes: many(customerNotes, { relationName: "customer_note" }),
  adminNotes: many(customerNotes, { relationName: "admin_note" }),
}));

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  phone: (schema) => schema.phone.regex(
    new RegExp(
      "\\+(9[976]\\d|8[987530]\\d|6[987]\\d|5[90]\\d|42\\d|3[875]\\d|2[98654321]\\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)(\\W*\\d){9,10}$"
    )
  ),
});
export const selectUserSchema = createSelectSchema(users);

export const cars = sqliteTable("cars", {
  // General Information
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").references(() => users.id),
  vin: text("vin").notNull().unique(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  reciever: text("reciever"),
  bookingNumber: text("booking_number"),
  containerNumber: text("container_number"),
  lotNumber: text("lot_number"),
  auctionLocation: text("auction_location"),
  trackingLink: text("tracking_link"),
  destinationPort: text("destination_port").default("Poti"),
  // Purchase/Auction Fees
  purchaseFee: integer("purchase_fee").notNull(),
  auctionFee: integer("auction_fee"),
  gateFee: integer("gate_fee"),
  titleFee: integer("title_fee"),
  environmentalFee: integer("environmental_fee"),
  virtualBidFee: integer("virtual_bid_fee"),
  // Shipping Fees
  shippingFee: integer("shipping_fee"),
  groundFee: integer("ground_fee"),
  oceanFee: integer("ocean_fee"),
  // Total Fee
  totalFee: integer("total_fee"),
  // Dates
  arrivalDate: integer("arrival_date", { mode: "timestamp" }),
  departureDate: integer("departure_date", { mode: "timestamp" }),
  purchaseDate: integer("purchase_date", { mode: "timestamp" }).notNull(),
  // Selects
  auction: text("auction", {
    enum: ["Copart", "IAAI",],
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
  insurance: text("insurance", {
    enum: ["YES", "NO"],
  }).notNull(),
  shippingStatus: text("shipping_status", {
    enum: ["AUCTION", "INNER_TRANSIT", "WAREHOUSE", "LOADED", "SAILING", "DELIVERED"],
  }).notNull(),
  bodyType: text("body_type", {
    enum: ["SEDAN", "ATV", "SUV", "PICKUP", "BIKE"],
  }).notNull(),
  fuelType: text("fuel_type", {
    enum: ["GASOLINE", "HYBRID_ELECTRIC"],
  }).notNull(),
  dueDate: integer("due_date", { mode: "timestamp" }),
}, (table) => {
  return {
    vinIdx: uniqueIndex("vin_idx").on(table.vin),
    ownerIdx: index("owner_idx").on(table.ownerId),
    purchaseDateIdx: index("purchase_date_idx").on(table.purchaseDate),
    dueDateIdx: index("cars_due_date_idx").on(table.dueDate),
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
  dueDate: z.date().optional(),
  ownerId: (schema) => schema.ownerId
    .optional()
    .nullable()
    .transform((val) => {
      // Convert empty string to null for database consistency
      if (val === "" || val === "none") {
        return null;
      }
      return val;
    }),
});
export const selectCarSchema = createSelectSchema(cars);

export const images = sqliteTable("images", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  carVin: text("car_vin").references(() => cars.vin, {
    onDelete: "cascade",
  }).notNull(),
  imageType: text("image_type", {
    enum: ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERED"],
  }).notNull(),
  imageKey: text("image_key").notNull(),
  priority: integer("priority", { mode: "boolean" }).default(false),
}, (table) => {
  return {
    imageKeyIdx: uniqueIndex("image_key_idx").on(table.imageKey),
    carVinIdx: index("images_car_vin_idx").on(table.carVin),
    priorityIdx: index("images_priority_idx").on(table.priority),
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

// Customer notes table for admin notes about customers
export const customerNotes = sqliteTable("customer_notes", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  customerId: text("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  adminId: text("admin_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  isImportant: integer("is_important", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => {
  return {
    customerIdIdx: index("customer_notes_customer_id_idx").on(table.customerId),
    adminIdIdx: index("customer_notes_admin_id_idx").on(table.adminId),
    createdAtIdx: index("customer_notes_created_at_idx").on(table.createdAt),
    isImportantIdx: index("customer_notes_is_important_idx").on(table.isImportant),
  }
});

export const customerNotesRelations = relations(customerNotes, ({ one }) => ({
  customer: one(users, {
    fields: [customerNotes.customerId],
    references: [users.id],
    relationName: "customer_note",
  }),
  admin: one(users, {
    fields: [customerNotes.adminId],
    references: [users.id],
    relationName: "admin_note",
  }),
}));

export const insertCustomerNoteSchema = createInsertSchema(customerNotes);
export const selectCustomerNoteSchema = createSelectSchema(customerNotes);

// New tables for user-based pricing system
export const userPricingConfig = sqliteTable("user_pricing_config", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Remove single oceanFee field and replace with oceanRates JSON
  oceanRates: text("ocean_rates", { mode: "json" }).$type<Array<{ state: string, shorthand: string, rate: number }>>().notNull().default(sql`'[]'`),
  groundFeeAdjustment: integer("ground_fee_adjustment").notNull().default(0),
  pickupSurcharge: integer("pickup_surcharge").notNull().default(300),
  serviceFee: integer("service_fee").notNull().default(100),
  hybridSurcharge: integer("hybrid_surcharge").notNull().default(150),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => {
  return {
    userIdIdx: index("user_pricing_config_user_id_idx").on(table.userId),
    isActiveIdx: index("user_pricing_config_is_active_idx").on(table.isActive),
  }
});

// Updated default pricing config to support multiple ocean rates
export const defaultPricingConfig = sqliteTable("default_pricing_config", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  // Remove single oceanFee field and replace with oceanRates JSON
  oceanRates: text("ocean_rates", { mode: "json" }).$type<Array<{ state: string, shorthand: string, rate: number }>>().notNull().default(sql`'[]'`),
  groundFeeAdjustment: integer("ground_fee_adjustment").notNull().default(0),
  pickupSurcharge: integer("pickup_surcharge").notNull().default(300),
  serviceFee: integer("service_fee").notNull().default(100),
  hybridSurcharge: integer("hybrid_surcharge").notNull().default(150),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const csvDataVersions = sqliteTable("csv_data_versions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  versionName: text("version_name").notNull(),
  csvData: text("csv_data").notNull(), // JSON string
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  uploadedBy: text("uploaded_by").notNull().references(() => users.id),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  description: text("description"),
}, (table) => {
  return {
    isActiveIdx: index("csv_data_versions_is_active_idx").on(table.isActive),
    uploadedByIdx: index("csv_data_versions_uploaded_by_idx").on(table.uploadedBy),
  }
});

// New table for ocean shipping rates
export const oceanShippingRates = sqliteTable("ocean_shipping_rates", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  state: text("state").notNull(), // e.g., "Los Angeles, CA"
  shorthand: text("shorthand").notNull(), // e.g., "CA"
  rate: integer("rate").notNull(), // Rate in dollars
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => {
  return {
    stateIdx: index("ocean_shipping_rates_state_idx").on(table.state),
    shorthandIdx: index("ocean_shipping_rates_shorthand_idx").on(table.shorthand),
    isActiveIdx: index("ocean_shipping_rates_is_active_idx").on(table.isActive),
  }
});

// Relations for new tables
export const userPricingConfigRelations = relations(userPricingConfig, ({ one }) => ({
  user: one(users, {
    fields: [userPricingConfig.userId],
    references: [users.id],
  }),
}));

export const csvDataVersionsRelations = relations(csvDataVersions, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [csvDataVersions.uploadedBy],
    references: [users.id],
  }),
}));

// Schemas for new tables
export const insertUserPricingConfigSchema = createInsertSchema(userPricingConfig);
export const selectUserPricingConfigSchema = createSelectSchema(userPricingConfig);

export const insertDefaultPricingConfigSchema = createInsertSchema(defaultPricingConfig);
export const selectDefaultPricingConfigSchema = createSelectSchema(defaultPricingConfig);

export const insertCsvDataVersionSchema = createInsertSchema(csvDataVersions);
export const selectCsvDataVersionSchema = createSelectSchema(csvDataVersions);

export const insertOceanShippingRatesSchema = createInsertSchema(oceanShippingRates);
export const selectOceanShippingRatesSchema = createSelectSchema(oceanShippingRates);
