"use server";

import { validateRequest } from "@/lib/auth";
import { DatabaseUser, db } from "@/lib/db";
import {
  APIAssetsResponse,
  CarData,
  CarResponse,
  DbCar,
  UserWithCar,
} from "@/lib/interfaces";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

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

async function compressImageBuffer(imageBuffer: Buffer) {
  const compressedBuffer = await sharp(imageBuffer)
    .resize({ width: 400 })
    .jpeg({ quality: 50 })
    .toBuffer();

  return compressedBuffer;
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

export async function assignCarToUser(
  userId: string,
  formData: FormData,
): Promise<void> {
  const vin = formData.get("car_vin") as string;
  try {
    const car: DbCar | undefined = await getCarFromDatabase(vin);

    if (!car) {
      throw new Error(`Car with VIN ${vin} not found`);
    }

    const carId: number = car.id;

    db.prepare(
      `
      INSERT INTO user_car (user_id, car_id)
      VALUES (?, ?)
    `,
    ).run(userId, carId);

    console.log(`Car with VIN ${vin} assigned to user with ID ${userId}`);
    revalidatePath(`/users/${userId}`)
  } catch (e) {
    console.error(e);
    throw new Error("Failed to assign car to user");
  }
}

export async function getUsers(): Promise<DatabaseUser[] | undefined> {
  try {
    const users = db
      .prepare("SELECT * FROM user WHERE role_id = 1")
      .all() as DatabaseUser[];

    if (users.length === 0) {
      console.warn("No users found");
      return undefined;
    }

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

export async function getUser(id: string): Promise<UserWithCar | undefined> {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.password, u.role_id,
             c.vin, c.arrivalDate, c.destinationPort
      FROM user u
      LEFT JOIN user_car uc ON u.id = uc.user_id
      LEFT JOIN car c ON uc.car_id = c.id
      WHERE u.id = ?
    `;

    const rows = db.prepare(query).all(id) as Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      password: string;
      role_id: number;
      vin: string;
      arrivalDate: string;
      destinationPort: string;
    }>;

    if (rows.length === 0) {
      throw new Error("No user found");
    }

    const user: UserWithCar = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      phone: rows[0].phone,
      password: rows[0].password,
      role_id: rows[0].role_id,
      cars: rows
        .filter((row) => row.vin !== null)
        .map((row) => ({
          vin: row.vin,
          arrivalDate: row.arrivalDate,
          destinationPort: row.destinationPort,
        })),
    };

    console.log(user)

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return undefined;
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

    if (!car) {
      return undefined;
    }

    const images = db
      .prepare(
        `
      SELECT imageBlob 
      FROM images 
      WHERE car_id = ?
      `,
      )
      .all(car.id) as { imageBlob: Buffer }[];

    car.images = images.map((row: { imageBlob: Buffer }) =>
      row.imageBlob.toString("base64"),
    );

    return car;
  } catch (e) {
    console.error(e);
  }
}

async function fetchImageBuffer(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${imageUrl}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
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

export async function getImagesByVinFromAPI(
  vin: string,
): Promise<APIAssetsResponse | undefined> {
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

    const data: APIAssetsResponse = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}
