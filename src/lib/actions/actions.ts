"use server";

import { db } from "../drizzle/db";
import { APIAssetsResponse, UserWithCarsAndSpecs } from "@/lib/interfaces";
import { revalidatePath } from "next/cache";
import { ensureToken } from "./tokenActions";
import {
  carTable,
  imageTable,
  parkingDetailsTable,
  specificationsTable,
  userTable,
} from "../drizzle/schema";
import { fetchAssets } from "./imageActions";
import { APICarResponse, APICar } from "../api-interfaces";
import { ActionResult } from "../form";
import { getUser } from "./dbActions";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

type NewCar = typeof carTable.$inferInsert;
type NewSpecification = typeof specificationsTable.$inferInsert;
type NewParkingDetails = typeof parkingDetailsTable.$inferInsert;
type NewImage = typeof imageTable.$inferInsert;

const insertImage = async (vin: string, imageUrl: string) => {
  const image: NewImage = {
    carVin: vin,
    imageUrl: imageUrl,
  };

  return db.insert(imageTable).values(image);
};

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

export async function logSomething(email: string): Promise<void> {
  console.log("Logging something", email);
}

export async function removeUser(
  id: string,
): Promise<ActionResult | undefined> {
  try {
    if (!id) {
      return {
        error: "No user ID provided",
      };
    }

    const userToFind: UserWithCarsAndSpecs | undefined = await getUser(id);

    if (!userToFind) {
      console.log(`User with ID ${id} not found.`);
      return { error: "User not found" };
    }

    const result = await db
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning({ deletedId: userTable.id });

    if (result.length === 0 || !result[0].deletedId) {
      console.log(`User with ID ${id} not found or deletion failed.`);
      return { error: "Deletion failed" };
    }

    console.log(`User with ID ${result[0].deletedId} removed successfully.`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to remove user in database");
  } finally {
    revalidatePath("/admin/users/");
    return redirect("/admin/users/");
  }
}

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
        runndrive:
          specifications?.runndrive === true
            ? "true"
            : specifications?.runndrive || null,
        fuelType: specifications?.fuelType || null,
      };

      const newParkingDetails: NewParkingDetails = {
        fined:
          parkingDetails?.fined === true
            ? "true"
            : parkingDetails?.fined || null,
        arrived:
          parkingDetails?.arrived === true
            ? "true"
            : parkingDetails?.arrived || null,
        status: parkingDetails?.status || null,
        parkingDateString: parkingDetails?.parkingDateString || null,
      };

      const spId = await insertSpecification(newSpecification);
      const pdId = await insertParkingDetails(newParkingDetails);

      const newCar: NewCar = {
        vin: specifications?.vin || "",
        originPort: shipment?.originPort?.toString() || null,
        destinationPort: shipment?.destinationPort?.toString() || null,
        departureDate: shipment?.departureDate?.toString() || null,
        arrivalDate: shipment?.arrivalDate?.toString() || null,
        auction: auction?.name?.toString() || null,
        createdAt: createdAt?.toString() || null,
        shipping: shipping?.name?.toString() || null,
        specificationsId: spId[0].specificationsId,
        parkingDetailsId: pdId[0].parkingDetailsId,
      };

      await insertCar(newCar);

      if (specifications?.vin) {
        const assets: APIAssetsResponse | undefined = await fetchAssets(
          specifications.vin,
        );

        if (assets) {
          const images = assets.assets.filter(
            (asset) => asset.type.toLowerCase() === "image",
          );
          if (images.length > 0) {
            const imageUrl = images[0].value; // Make sure to use the 'value' property for the URL
            await insertImage(specifications.vin, imageUrl);
          }
        } else {
          console.log(`No assets found for VIN: ${specifications.vin}`);
        }
      } else {
        console.log("VIN is undefined for car:", data);
      }
    }

    revalidatePath("/admin");
  } catch (error) {
    console.error("Error updating local database:", error);
  }
}
