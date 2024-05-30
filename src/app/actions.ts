"use server";

import { validateRequest } from "@/lib/auth";
import { DatabaseUser, db } from "@/lib/db";
import { CarData, CarResponse, DbCar } from "@/lib/interfaces";
import { revalidatePath } from "next/cache";

let token: string | null = null;
let tokenExpiry: number | null = null;

async function validateAdmin(): Promise<boolean> {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return false;
  }
  return true;
}

async function validateUser(): Promise<boolean> {
  const { user } = await validateRequest();
  if (!user) {
    return false;
  }
  return true;
}

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

export async function fetchCar(vin: string): Promise<CarData | undefined> {
  try {
    await ensureToken();

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

export async function getCarsFromDatabase(): Promise<DbCar[]> {
  try {
    const cars: DbCar[] = db
      .prepare(
        `
        SELECT 
          c.id,
          c.vin, 
          s.year, 
          s.make, 
          s.model, 
          s.trim,
          s.manufacturer,
          s.country,
          s.titleNumber,
          s.engineType,
          s.fuelType,
          s.carfax,
          p.fined, 
          p.arrived, 
          p.status, 
          p.parkingDateString,
          c.originPort,
          c.destinationPort,
          c.shipping
        FROM 
          car c
        LEFT JOIN 
          specifications s ON c.specifications_id = s.id
        LEFT JOIN 
          parking_details p ON c.parking_details_id = p.id
        `,
      )
      .all() as DbCar[];

    if (cars.length === 0) {
      throw new Error("No cars found");
    }

    return cars;
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
}

export async function getCarFromDatabase(
  vin: string,
): Promise<DbCar | undefined> {
  try {
    const car: DbCar = db
      .prepare(
        `
        SELECT 
          c.id,
          c.vin, 
          s.year, 
          s.make, 
          s.model, 
          s.trim,
          s.manufacturer,
          s.country,
          s.titleNumber,
          s.engineType,
          s.fuelType,
          s.carfax,
          p.fined, 
          p.arrived, 
          p.status, 
          p.parkingDateString,
          c.originPort,
          c.destinationPort,
          c.shipping
        FROM 
          car c
        LEFT JOIN 
          specifications s ON c.specifications_id = s.id
        LEFT JOIN 
          parking_details p ON c.parking_details_id = p.id
        WHERE 
          c.vin = ?
        `,
      )
      .get(vin) as DbCar;

    return car;
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
      INSERT INTO images (imageLink, car_id)
      VALUES (?,?)
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
        specifications?.year ?? null,
        specifications?.carfax ?? null,
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
      const images = assets.assets
        .filter((asset: any) => asset.type === "Image")
        .map((asset: any) => ({
          imageLink: asset.value,
        }));

      for (const image of images) {
        const link = image.imageLink;
        const imageParams: (string | number | null)[] = [
          link?.toString() ?? null,
          carId,
        ];
        imageInsert.run(...imageParams);
      }
    }

    revalidatePath("/admin");
  } catch (error) {
    console.error("Error updating local database:", error);
  } finally {
  }
}

export async function getImagesByVinFromAPI(vin: string) {
  try {
    await ensureToken();

    if (!token) {
      throw new Error("No valid token available");
    }
    const res = await fetch(
      `https://backend.app.mtlworld.com/api/vehicle/${vin}/assets`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch car");
    }

    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}
