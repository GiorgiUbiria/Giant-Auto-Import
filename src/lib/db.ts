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
    carfax TEXT,
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

db.exec(`CREATE TABLE IF NOT EXISTS parking_details (
    id INTEGER PRIMARY KEY,
    fined BOOL,
    arrived BOOL,
    status TEXT,
    parkingDateString TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS car (
    id INTEGER PRIMARY KEY,
    vin TEXT,
    originPort TEXT,
    destinationPort TEXT,
    departureDate DATE,
    arrivalDate DATE,
    auction TEXT,
    createdAt DATE,
    shipping TEXT,
    specifications_id INTEGER,
    parking_details_id INTEGER,
    FOREIGN KEY (specifications_id) REFERENCES specifications(id),
    FOREIGN KEY (parking_details_id) REFERENCES parking_details(id)
)`);
// Assets
// {
//   type: 'Image',
//   source: 'MTL',
//   value: 'https://media.mtlworld.win/api/content/5NPE34AB2JH673039/Image/0ef9105406d3efe534ab69d7b27788e7c23d5c70.JPG'
// },

// Single Car
// {
//   data: {
//     vin: '5NPE34AB2JH673039',
//     specifications: {
//       vin: '5NPE34AB2JH673039',
//       carfax: '2018 HYUNDAI SONATA SPORT 2.0T; LIMITED 2.0T',
//       description: '2018 HYUNDAI SONATA SPORT 2.0T; LIMITED 2.0T',
//       year: '2018',
//       make: 'Hyundai',
//       model: 'Sonata',
//       trim: 'Sport 2.0T; Limited 2.0T',
//       vehicleClass: 'Mid-size Car',
//       type: 'Passenger Car',
//       manufacturer: 'Hyundai-Kia America Technical Center Inc.',
//       bodyType: '4 Door Sedan',
//       country: 'UNITED STATES',
//       engineType: 'L4, 2.0L; Turbo',
//       titleNumber: '139733605',
//       titleState: 'FL',
//       color: null,
//       runndrive: false,
//       fuelType: null,
//       primaryFuelType: null,
//       secondaryFuelType: null
//     },
//     parkingDetails: {
//       fined: false,
//       arrived: false,
//       inspected: false,
//       status: 'OnHand',
//       lot: null,
//       parkingDate: '2024-05-23T09:58:14.000Z',
//       parkingDateString: 'Thu May 23 2024',
//       updatedAt: '2024-05-23T10:00:44.547Z'
//     },
//     shipment: {
//       container: null,
//       name: null,
//       booking: null,
//       originPort: 'Savannah',
//       destinationPort: 'Poti',
//       waybillOut: null,
//       masterWaybillOut: null,
//       carrierOut: null,
//       vehicleIds: [],
//       arrivalDate: null,
//       departureDate: null
//     },
//     shipping: { name: 'Giant Auto Import LLC', presented: true },
//     auction: null,
//     createdAt: '2024-05-23T09:58:14.000Z'
// }

db.exec(`CREATE TABLE IF NOT EXISTS user_car (
    user_id INTEGER,
    car_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (car_id) REFERENCES car(id),
    PRIMARY KEY (user_id, car_id)
)`);

// Status, Date, Vehicle, Vin, Fuel Type, Container, Booking, Shipment, Note, Title, Keys, Origin Port, Destination, Lot, Shipping Company

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role_id: number;
}
