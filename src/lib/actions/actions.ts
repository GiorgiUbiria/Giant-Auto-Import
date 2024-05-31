"use server";

import { db } from "@/lib/db";
import { CarData, CarResponse } from "@/lib/interfaces";
import { revalidatePath } from "next/cache";
import { ensureToken } from "./tokenActions";
import {
  fetchImageBuffer,
  compressImageBuffer,
  getImagesByVinFromAPI,
} from "./imageActions";

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

    const specificationsInsert = db.prepare(`
      INSERT INTO specifications (vin, carfax, year, make, model, trim, manufacturer, bodyType, country, engineType, titleNumber, titleState, color, runndrive, fuelType)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);

    const carInsert = db.prepare(`
      INSERT INTO car (vin, originPort, destinationPort, departureDate, arrivalDate, auction, createdAt, shipping, specifications_id, parking_details_id)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `);

    const parkingDetailsInsert = db.prepare(`
      INSERT INTO parking_details (fined, arrived, status, parkingDateString)
      VALUES (?,?,?,?)
    `);

    const imageInsert = db.prepare(`
      INSERT INTO images (imageLink, imageBlob, car_id)
      VALUES (?, ?, ?)
    `);

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

      const specificationsParams: (string | number | null)[] = [
        vin,
        specifications?.carfax ?? null,
        specifications?.year ?? null,
        specifications?.make ?? null,
        specifications?.model ?? null,
        specifications?.trim ?? null,
        specifications?.manufacturer ?? null,
        specifications?.bodyType ?? null,
        specifications?.country ?? null,
        specifications?.engineType ?? null,
        specifications?.titleNumber ?? null,
        specifications?.titleState ?? null,
        specifications?.color ?? null,
        specifications?.runndrive ? 1 : 0,
        specifications?.fuelType ?? null,
      ];

      let specificationsId: number = specificationsInsert.run(
        ...specificationsParams,
      ).lastInsertRowid as number;

      const parkingDetailsParams: (string | number | null | boolean)[] = [
        parkingDetails?.fined?.toString() ?? null,
        parkingDetails?.arrived?.toString() ?? null,
        parkingDetails?.status?.toString() ?? null,
        parkingDetails?.parkingDateString ?? null,
      ];

      let parkingDetailsId: number = parkingDetailsInsert.run(
        ...parkingDetailsParams,
      ).lastInsertRowid as number;

      const carParams: (string | number | null)[] = [
        vin,
        shipment?.originPort?.toString() ?? null,
        shipment?.destinationPort?.toString() ?? null,
        shipment?.departureDate?.toString() ?? null,
        shipment?.arrivalDate?.toString() ?? null,
        JSON.stringify(auction) ?? null,
        createdAt?.toString() ?? null,
        shipping?.name?.toString() ?? null,
        specificationsId,
        parkingDetailsId,
      ];

      let carId: number = carInsert.run(...carParams).lastInsertRowid as number;

      const assets = await getImagesByVinFromAPI(vin);
      const images = assets?.assets
        .filter((asset: any) => asset.type === "Image")
        .map((asset: any) => ({
          imageLink: asset.value,
        }));

      if (images) {
        for (const image of images) {
          const link = image.imageLink;
          try {
            const imageBuffer = await fetchImageBuffer(link);
            const compressedImageBuffer =
              await compressImageBuffer(imageBuffer);
            const imageParams: (string | Buffer | number | null)[] = [
              link?.toString() ?? null,
              compressedImageBuffer,
              carId,
            ];
            imageInsert.run(...imageParams);
          } catch (error) {
            console.error(`Error fetching image from ${link}:`, error);
          }
        }
      }
    }

    revalidatePath("/admin");
  } catch (error) {
    console.error("Error updating local database:", error);
  } finally {
  }
}
