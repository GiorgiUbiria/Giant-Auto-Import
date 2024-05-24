"use server";

import { DatabaseUser, db } from "@/lib/db";
import { CarResponse } from "@/lib/interfaces";

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

export async function getCarsFromDatabase(): Promise<any> {
  try {
    const cars = db.prepare(`
      SELECT 
        c.*, 
        s.year, 
        s.make, 
        s.model, 
        s.trim,
        s.manufacturer,
        s.country,
        s.titleNumber,
        s.engineType,
        s.fuelType
      FROM 
        car c
      JOIN 
        specifications s ON c.specifications_id = s.id
    `).all();

    if (cars.length === 0) {
      throw new Error("No cars found");
    }

    return cars;
  } catch (error) {
    console.error("Error fetching cars:", error);
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
      INSERT INTO specifications (vin, year, make, model, trim, manufacturer, bodyType, country, engineType, titleNumber, titleState, color, runndrive, fuelType)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);

    const carInsert = db.prepare(`
      INSERT INTO car (vin, location, specifications_id, auction, createdAt)
      VALUES (?,?,?,?,?)
    `);

    for (const car of cars.data) {
      const { vin, specifications } = car;

      const specificationsParams: (string | number | null)[] = [
        vin,
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

      const carParams: (string | number | null)[] = [
        vin,
        car?.location ?? null,
        specificationsId,
        JSON.stringify(car?.auction) ?? null,
        "Date",
      ];

      carInsert.run(...carParams);
    }
  } catch (error) {
    console.error("Error updating local database:", error);
  } finally {
  }
}
