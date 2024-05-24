"use server";

import { DatabaseUser, db } from "@/lib/db";
import { CarData, CarResponse } from "@/lib/interfaces";

let token: string | null = null;
let tokenExpiry: number | null = null;

async function fetchToken(): Promise<void> {
  const login = process.env.MTL_USER_LOGIN as string;
  const password = process.env.MTL_USER_PASSWORD as string;

  try {
    const res = await fetch("https://backend.app.mtlworld.com/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });

    const data = await res.json();

    if (data.accessToken) {
      token = data.accessToken as string;

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      tokenExpiry = tokenPayload.exp * 1000;
    } else {
      throw new Error("Failed to fetch token");
    }
  } catch (error) {
    console.error("Error fetching token:", error);
  }
}

async function ensureToken(): Promise<void> {
  if (!token || !tokenExpiry || Date.now() >= tokenExpiry - 60000) {
    await fetchToken();
  }
}

export async function getCars(): Promise<any> {
  try {
    const cars = db
      .prepare(
        `
      SELECT * FROM car
    `,
      )
      .get();

    if (!cars) {
      throw new Error("No cars found");
    }

    console.log(cars);
    return cars;
  } catch (error) {
    console.error("Error getting cars:", error);
    return [];
  }
}

export async function fetchCars(): Promise<CarResponse | undefined> {
  try {
    await ensureToken();

    if (!token) {
      throw new Error("No valid token available");
    }

    const res = await fetch("https://backend.app.mtlworld.com/api/vehicles", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch cars");
    }

    const data: CarResponse | undefined = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching cars:", error);
  }
}

export async function updateCarsFromAPI(): Promise<void> {
  try {
    const cars: CarResponse | undefined = await fetchCars();

    if (cars) {
      db.transaction(() => {
        cars.data.forEach((car: CarData) => {
          // Insert specifications
          const specificationsStmt = db.prepare(`
            INSERT INTO specifications (
                vin, carfax, description, year, make, model, trim, vehicleClass, type,
                manufacturer, bodyType, country, engineType, titleNumber, titleState,
                color, runndrive, fuelType, primaryFuelType, secondaryFuelType
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          const specificationsId = specificationsStmt.run(
            car.specifications.vin,
            car.specifications.carfax,
            car.specifications.description,
            car.specifications.year,
            car.specifications.make,
            car.specifications.model,
            car.specifications.trim,
            car.specifications.vehicleClass,
            car.specifications.type,
            car.specifications.manufacturer,
            car.specifications.bodyType,
            car.specifications.country,
            car.specifications.engineType,
            car.specifications.titleNumber,
            car.specifications.titleState,
            car.specifications.color,
            car.specifications.runndrive ? 1 : 0,
            car.specifications.fuelType,
            car.specifications.primaryFuelType,
            car.specifications.secondaryFuelType,
          ).lastInsertRowid;

          // Insert parking details
          const parkingDetailsStmt = db.prepare(`
            INSERT INTO parking_details (
                fined, arrived, inspected, status, lot, parkingDate, parkingDateString, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          const parkingDetailsId = parkingDetailsStmt.run(
            car.parkingDetails.fined ? 1 : 0,
            car.parkingDetails.arrived ? 1 : 0,
            car.parkingDetails.inspected ? 1 : 0,
            car.parkingDetails.status,
            car.parkingDetails.lot,
            car.parkingDetails.parkingDate,
            car.parkingDetails.parkingDateString,
            car.parkingDetails.updatedAt,
          ).lastInsertRowid;

          // Insert papers
          const papersStmt = db.prepare(`
            INSERT INTO papers (title, billOfSale, invoice, inspection, inspectionSet, titleSet, billOfSaleSet)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          const papersId = papersStmt.run(
            car.papers.title,
            car.papers.billOfSale,
            car.papers.invoice,
            car.papers.inspection,
            car.papers.inspectionSet ? 1 : 0,
            car.papers.titleSet ? 1 : 0,
            car.papers.billOfSaleSet ? 1 : 0,
          ).lastInsertRowid;

          // Insert shipment
          const vehicleIds = car.shipment.vehicleIds
            .map((vehicle: { vin: string }) => vehicle.vin)
            .join(",");
          const shipmentStmt = db.prepare(`
            INSERT INTO shipment (
                container, name, booking, originPort, destinationPort, waybillOut,
                masterWaybillOut, carrierOut, vehicleIds, arrivalDate, departureDate, receipt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          const shipmentId = shipmentStmt.run(
            car.shipment.container,
            car.shipment.name,
            car.shipment.booking,
            car.shipment.originPort,
            car.shipment.destinationPort,
            car.shipment.waybillOut,
            car.shipment.masterWaybillOut,
            car.shipment.carrierOut,
            vehicleIds,
            car.shipment.arrivalDate,
            car.shipment.departureDate,
            car.shipment.receipt,
          ).lastInsertRowid;

          // Insert notes
          const notesStmt = db.prepare(`
            INSERT INTO notes (customerNotes, mtlNotes) VALUES (?, ?)
          `);
          const notesId = notesStmt.run(
            car.notes.customerNotes,
            car.notes.mtlNotes,
          ).lastInsertRowid;

          // Insert shipping
          const shippingStmt = db.prepare(`
            INSERT INTO shipping (name, presented) VALUES (?, ?)
          `);
          const shippingId = shippingStmt.run(
            car.shipping.name,
            car.shipping.presented ? 1 : 0,
          ).lastInsertRowid;

          // Insert additional
          const additionalStmt = db.prepare(`
            INSERT INTO additional (keys01) VALUES (?)
          `);
          const additionalId = additionalStmt.run(
            car.additional.keys01,
          ).lastInsertRowid;

          // Insert car
          const carStmt = db.prepare(`
            INSERT INTO car (
                vin, location, specifications_id, parking_details_id, papers_id, shipment_id,
                notes_id, shipping_id, auction, additional_id, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          carStmt.run(
            car.vin,
            car.location,
            specificationsId,
            parkingDetailsId,
            papersId,
            shipmentId,
            notesId,
            shippingId,
            car.auction,
            additionalId,
            car.createdAt,
          );

          // Insert user_car
          const carUserStmt = db.prepare(`
            INSERT INTO user_car (user_id, car_id) VALUES (?, ?)
          `);
          carUserStmt.run("", car.vin);
        });
      });
    }
  } catch (error) {
    console.error("Error updating cars from API:", error);
  }
}

export async function getUsers(): Promise<any> {
  try {
    const users = db.prepare("SELECT * FROM user WHERE role_id = 1").get() as
      | DatabaseUser[]
      | undefined;
    if (!users) {
      throw new Error("No users found");
    }

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}
