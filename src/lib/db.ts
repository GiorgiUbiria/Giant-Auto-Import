import sqlite from "better-sqlite3";

export const db = sqlite("main.db");

db.exec(`CREATE TABLE IF NOT EXISTS roles (
    id INTEGER NOT NULL PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE 
)`);

db.exec(`INSERT OR IGNORE INTO roles (role_name) VALUES ('user')`);
db.exec(`INSERT OR IGNORE INTO roles (role_name) VALUES ('admin')`);

db.exec(`CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS specifications (
    id INTEGER PRIMARY KEY,
    vin TEXT NOT NULL,
    carfax TEXT NOT NULL,
    description TEXT NOT NULL,
    year TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    trim TEXT NOT NULL,
    vehicleClass TEXT NOT NULL,
    type TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    bodyType TEXT NOT NULL,
    country TEXT NOT NULL,
    engineType TEXT NOT NULL,
    titleNumber TEXT NOT NULL,
    titleState TEXT NOT NULL,
    color TEXT,
    runndrive INTEGER NOT NULL,
    fuelType TEXT,
    primaryFuelType TEXT,
    secondaryFuelType TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS parking_details (
    id INTEGER PRIMARY KEY,
    fined INTEGER NOT NULL,
    arrived INTEGER NOT NULL,
    inspected INTEGER NOT NULL,
    status TEXT NOT NULL,
    lot TEXT,
    parkingDate TEXT NOT NULL,
    parkingDateString TEXT NOT NULL,
    updatedAt TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS papers (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    billOfSale TEXT,
    invoice TEXT,
    inspection TEXT NOT NULL,
    inspectionSet INTEGER NOT NULL,
    titleSet INTEGER NOT NULL,
    billOfSaleSet INTEGER NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS shipment (
    id INTEGER PRIMARY KEY,
    container TEXT,
    name TEXT,
    booking TEXT,
    originPort TEXT NOT NULL,
    destinationPort TEXT NOT NULL,
    waybillOut TEXT,
    masterWaybillOut TEXT,
    carrierOut TEXT,
    vehicleIds TEXT NOT NULL,
    arrivalDate TEXT,
    departureDate TEXT,
    receipt TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY,
    customerNotes TEXT,
    mtlNotes TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS shipping (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    presented INTEGER NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS additional (
    id INTEGER PRIMARY KEY,
    keys01 TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS car (
    id INTEGER PRIMARY KEY,
    vin TEXT NOT NULL,
    location TEXT NOT NULL,
    specifications_id INTEGER NOT NULL,
    parking_details_id INTEGER NOT NULL,
    papers_id INTEGER NOT NULL,
    shipment_id INTEGER NOT NULL,
    notes_id INTEGER NOT NULL,
    shipping_id INTEGER NOT NULL,
    auction TEXT,
    additional_id INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (specifications_id) REFERENCES specifications(id),
    FOREIGN KEY (parking_details_id) REFERENCES parking_details(id),
    FOREIGN KEY (papers_id) REFERENCES papers(id),
    FOREIGN KEY (shipment_id) REFERENCES shipment(id),
    FOREIGN KEY (notes_id) REFERENCES notes(id),
    FOREIGN KEY (shipping_id) REFERENCES shipping(id),
    FOREIGN KEY (additional_id) REFERENCES additional(id)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS user_car (
    user_id INTEGER,
    car_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (car_id) REFERENCES car(id),
    PRIMARY KEY (user_id, car_id)
)`);

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role_id: number;
}
