"use server";

import { db } from "../drizzle/db";
import { revalidatePath } from "next/cache";
import { ensureToken } from "./tokenActions";
import {
  carTable,
  parkingDetailsTable,
  specificationsTable,
} from "../drizzle/schema";
import { APICarResponse, APICar } from "../api-interfaces";
import { CarStatus } from "../interfaces";
import { getCarFromDatabase } from "./dbActions";

type NewCar = typeof carTable.$inferInsert;
type NewSpecification = typeof specificationsTable.$inferInsert;
type NewParkingDetails = typeof parkingDetailsTable.$inferInsert;

const insertCar = async (car: NewCar) => {
  return db.insert(carTable).values(car);
};

const insertSpecification = async (specification: NewSpecification) => {
  return db
    .insert(specificationsTable)
    .values(specification)
    .returning({ specificationsId: specificationsTable.id });
};

const insertParkingDetails = async (parkingDetails: NewParkingDetails) => {
  return db
    .insert(parkingDetailsTable)
    .values(parkingDetails)
    .returning({ parkingDetailsId: parkingDetailsTable.id });
};

export async function fetchCars(): Promise<APICarResponse | undefined> {
  try {
    const token = await ensureToken();

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

    const data: APICarResponse | undefined = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching cars:", error);
  }
}

export async function fetchCar(vin: string): Promise<APICar | undefined> {
  try {
    const token = await ensureToken();

    if (!token) {
      throw new Error("No valid token available");
    }

    const res = await fetch(
      `https://backend.app.mtlworld.com/api/vehicle/${vin}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const errorDetails = await res.text();
      throw new Error(
        `Failed to fetch car: ${res.status} - ${res.statusText} - ${errorDetails}`,
      );
    }

    const data: APICar = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}

export async function updateLocalDatabaseFromAPI(): Promise<void> {
  try {
    const cars: APICarResponse | undefined = await fetchCars();

    if (!cars) {
      console.log("No cars fetched.");
      return;
    }

    for (const data of cars.data) {
      const {
        specifications,
        parkingDetails,
        shipment,
        auction,
        createdAt,
        shipping,
      } = data;

      const findCar = await getCarFromDatabase(specifications?.vin!);

      if (findCar) {
        console.log("Car already exists in database");
        continue;
      }

      const newSpecification: NewSpecification = {
        vin: specifications?.vin || "",
        carfax: specifications?.carfax || null,
        year: specifications?.year || null,
        make: specifications?.make || null,
        model: specifications?.model || null,
        color: specifications?.color || null,
      };

      const newParkingDetails: NewParkingDetails = {
        status: parkingDetails?.status
          ? (parkingDetails?.status as CarStatus)
          : null,
      };

      const spId = await insertSpecification(newSpecification);
      const pdId = await insertParkingDetails(newParkingDetails);

      const newCar: NewCar = {
        vin: specifications?.vin || "",
        originPort: shipment?.originPort?.toString() || null,
        destinationPort: shipment?.destinationPort?.toString() || null,
        departureDate: shipment?.departureDate ?  new Date(shipment?.departureDate!) : new Date(),
        arrivalDate: shipment?.arrivalDate ?  new Date(shipment?.arrivalDate!) : new Date(),
        auction: auction?.name?.toString() || null,
        createdAt: createdAt ?  new Date(createdAt) : null,
        specificationsId: spId[0].specificationsId,
        parkingDetailsId: pdId[0].parkingDetailsId,
      };

      await insertCar(newCar);
    }

    revalidatePath("/admin");
  } catch (error) {
    console.error("Error updating local database:", error);
  }
}
