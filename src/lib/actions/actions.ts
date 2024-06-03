"use server";

import { db } from "../drizzle/db";
import { CarData, CarResponse } from "@/lib/interfaces";
import { revalidatePath } from "next/cache";
import { ensureToken } from "./tokenActions";
import {
  carTable,
  parkingDetailsTable,
  specificationsTable,
} from "../drizzle/schema";

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

export async function fetchCars(): Promise<CarResponse | undefined> {
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

    const data: CarResponse | undefined = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching cars:", error);
  }
}

export async function fetchCar(vin: string): Promise<CarData | undefined> {
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

    const data: CarData = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}

export async function updateLocalDatabaseFromAPI(): Promise<void> {
  try {
    const cars: CarResponse | undefined = await fetchCars();

    if (!cars) {
      console.log("No cars fetched.");
      return;
    }

    for (const data of cars.data) {
      const { car, specifications, parking_details } = data;

      const newSpecification: NewSpecification = {
        vin: specifications?.vin || "",
        carfax: specifications?.carfax || null,
        year: specifications?.year || null,
        make: specifications?.make || null,
        model: specifications?.model || null,
        trim: specifications?.trim || null,
        manufacturer: specifications?.manufacturer || null,
        country: specifications?.country || null,
        titleNumber: specifications?.titleNumber || null,
        titleState: specifications?.titleState || null,
        color: specifications?.color || null,
        runndrive: specifications?.runndrive
          ? "true"
          : specifications?.runndrive || null,
        fuelType: specifications?.fuelType || null,
      };

      const newParkingDetails: NewParkingDetails = {
        fined: parking_details?.fined ? "true" : parking_details?.fined || null,
        arrived: parking_details?.arrived
          ? "true"
          : parking_details?.arrived || null,
        status: parking_details?.status || null,
        parkingDateString: parking_details?.parkingDateString || null,
      };

      const spId = await insertSpecification(newSpecification);
      const pdId = await insertParkingDetails(newParkingDetails);

      const newCar: NewCar = {
        vin: specifications?.vin || "",
        originPort: car.originPort?.toString() || null,
        destinationPort: car?.destinationPort?.toString() || null,
        departureDate: car?.departureDate?.toString() || null,
        arrivalDate: car?.arrivalDate?.toString() || null,
        auction: car?.auction || null,
        createdAt: car?.toString() || null,
        shipping: car?.shipping || null,
        specificationsId: pdId[0].parkingDetailsId,
        parkingDetailsId: spId[0].specificationsId,
      };

      await insertCar(newCar);
    }

    revalidatePath("/admin");
  } catch (error) {
    console.error("Error updating local database:", error);
  } finally {
  }
}
