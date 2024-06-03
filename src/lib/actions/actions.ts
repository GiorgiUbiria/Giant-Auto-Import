"use server";

import { db } from "../drizzle/db";
import { CarData, CarResponse } from "@/lib/interfaces";
import { revalidatePath } from "next/cache";
import { ensureToken } from "./tokenActions";
import {
  fetchImageBuffer,
  compressImageBuffer,
  getImagesByVinFromAPI,
} from "./imageActions";
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
  return db.insert(specificationsTable).values(specification).returning({ specificationsId: specificationsTable.id });
};

const insertParkingDetails = async (parkingDetails: NewParkingDetails) => {
  return db.insert(parkingDetailsTable).values(parkingDetails).returning({ parkingDetailsId: parkingDetailsTable.id });
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

    for (const car of cars.data) {
      const {
        vin,
        specifications,
        parkingDetails,
        shipment,
        shipping,
        auction,
        createdAt,
      } = car;

      const newSpecification: NewSpecification = {
        vin: specifications.vin || "",
        carfax: specifications.carfax || null,
        year: specifications.year || null,
        make: specifications.make || null,
        model: specifications.model || null,
        trim: specifications.trim || null,
        manufacturer: specifications.manufacturer || null,
        country: specifications.country || null,
        titleNumber: specifications.titleNumber || null,
        titleState: specifications.titleState || null,
        color: specifications.color || null,
        runndrive:
          specifications.runndrive === true
            ? "true"
            : specifications.runndrive || null,
        fuelType: specifications.fuelType || null,
      };

      const newParkingDetails: NewParkingDetails = {
        fined:
          parkingDetails.fined === true ? "true" : parkingDetails.fined || null,
        arrived:
          parkingDetails.arrived === true
            ? "true"
            : parkingDetails.arrived || null,
        status: parkingDetails.status || null,
        parkingDateString: parkingDetails.parkingDateString || null,
      };

      const spId = await insertSpecification(newSpecification) 
      const pdId = await insertParkingDetails(newParkingDetails);

      const newCar: NewCar = {
        vin: specifications.vin || "",
        originPort: shipment?.originPort?.toString() || null,
        destinationPort: shipment?.destinationPort?.toString() || null,
        departureDate: shipment?.departureDate?.toString() || null,
        arrivalDate: shipment?.arrivalDate?.toString() || null,
        auction: auction || null,
        createdAt: createdAt?.toString() || null,
        shipping: shipping?.name?.toString() || null,
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
