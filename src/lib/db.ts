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
    vin TEXT,
    year TEXT,
    make TEXT,
    model TEXT,
    trim TEXT,
    manufacturer TEXT,
    bodyType TEXT,
    country TEXT,
    engineType TEXT,
    titleNumber TEXT,
    titleState TEXT,
    color TEXT,
    runndrive INTEGER,
    fuelType TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS car (
    id INTEGER PRIMARY KEY,
    vin TEXT,
    location TEXT,
    specifications_id INTEGER,
    auction TEXT,
    createdAt TEXT,
    FOREIGN KEY (specifications_id) REFERENCES specifications(id)
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
