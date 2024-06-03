"use server";

import { DatabaseUser, db } from "@/lib/db";
import { CarData, DbCar, UserWithCar } from "@/lib/interfaces";
import { revalidatePath } from "next/cache";
import { db as drizzleDb } from "../drizzle/db";
import {
  carTable,
  specificationsTable,
  parkingDetailsTable,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function updateCarInDb(
  id: number,
  formData: FormData,
): Promise<void> {
  try {
    const convertFormData = (key: string, defaultValue: any = null) => {
      const value = formData.get(key);
      switch (typeof defaultValue) {
        case "boolean":
          return value === "true" ? 1 : 0;
        case "string":
          return value?.toString() ?? defaultValue;
        default:
          return value ?? defaultValue;
      }
    };

    const fields = [
      "vin",
      "carfax",
      "year",
      "make",
      "model",
      "trim",
      "manufacturer",
      "country",
      "engineType",
      "fuelType",
      "titleNumber",
      "fined",
      "arrived",
      "status",
      "parkingDateString",
      "originPort",
      "destinationPort",
      "shipping",
    ];

    const carData: { [key: string]: any } = {};
    for (const field of fields) {
      carData[field] = convertFormData(field, null);
    }

    if (!id) {
      throw new Error("Car ID is required for update.");
    }

    const specificationsFields = [
      "vin",
      "carfax",
      "year",
      "make",
      "model",
      "trim",
      "manufacturer",
      "country",
      "engineType",
      "fuelType",
      "titleNumber",
    ];
    const specificationsUpdates = specificationsFields.filter(
      (field) => carData[field] !== null,
    );
    if (specificationsUpdates.length > 0) {
      const specificationsSql = `UPDATE specifications SET ${specificationsUpdates.map((field) => `${field} = ?`).join(", ")} WHERE id = (SELECT specifications_id FROM car WHERE id = ?)`;
      const specificationsParams = [
        ...specificationsUpdates.map((field) => carData[field]),
        id,
      ];
      db.prepare(specificationsSql).run(...specificationsParams);
    }

    const parkingDetailsFields = [
      "fined",
      "arrived",
      "status",
      "parkingDateString",
    ];
    const parkingDetailsUpdates = parkingDetailsFields.filter(
      (field) => carData[field] !== null,
    );
    if (parkingDetailsUpdates.length > 0) {
      const parkingDetailsSql = `UPDATE parking_details SET ${parkingDetailsUpdates.map((field) => `${field} = ?`).join(", ")} WHERE id = (SELECT parking_details_id FROM car WHERE id = ?)`;
      const parkingDetailsParams = [
        ...parkingDetailsUpdates.map((field) => carData[field]),
        id,
      ];
      db.prepare(parkingDetailsSql).run(...parkingDetailsParams);
    }

    const carFields = ["vin", "originPort", "destinationPort", "shipping"];
    const carUpdates = carFields.filter((field) => carData[field] !== null);
    if (carUpdates.length > 0) {
      const carSql = `UPDATE car SET ${carUpdates.map((field) => `${field} = ?`).join(", ")} WHERE id = ?`;
      const carParams = [...carUpdates.map((field) => carData[field]), id];
      db.prepare(carSql).run(...carParams);
    }

    console.log(`Car with ID ${id} updated successfully.`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update car in database");
  }
}

export async function addCarToDb(formData: FormData): Promise<void> {
  try {
    const convertFormData = (key: string, defaultValue: any = null) => {
      const value = formData.get(key);
      switch (typeof defaultValue) {
        case "boolean":
          return value === "true" ? 1 : 0;
        case "string":
          return value?.toString() ?? defaultValue;
        default:
          return value ?? defaultValue;
      }
    };

    const vin = convertFormData("vin", null);
    const carfax = convertFormData("carfax", null);
    const year = convertFormData("year", null);
    const make = convertFormData("make", null);
    const model = convertFormData("model", null);
    const trim = convertFormData("trim", null);
    const manufacturer = convertFormData("manufacturer", null);
    const bodyType = convertFormData("bodyType", null);
    const country = convertFormData("country", null);
    const engineType = convertFormData("engineType", null);
    const titleNumber = convertFormData("titleNumber", null);
    const titleState = convertFormData("titleState", null);
    const color = convertFormData("color", null);
    const fuelType = convertFormData("fuelType", null);

    const fined = convertFormData("fined", false);
    const arrived = convertFormData("arrived", false);
    const status = convertFormData("status", null);
    const parkingDateString = convertFormData("parkingDateString", null);

    const originPort = convertFormData("originPort", null);
    const destinationPort = convertFormData("destinationPort", null);
    const departureDate = convertFormData("departureDate", null);
    const arrivalDate = convertFormData("arrivalDate", null);
    const auction = convertFormData("auction", null);
    const createdAt = convertFormData("createdAt", null);
    const shipping = convertFormData("shipping", null);

    const specificationsSql = `
      INSERT INTO specifications (
        vin, carfax, year, make, model, trim, manufacturer, bodyType, country, engineType, titleNumber, titleState, color, fuelType
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    const specificationsId = db
      .prepare(specificationsSql)
      .run([
        vin,
        carfax,
        year,
        make,
        model,
        trim,
        manufacturer,
        bodyType,
        country,
        engineType,
        titleNumber,
        titleState,
        color,
        fuelType,
      ]).lastInsertRowid as number;

    const parkingDetailsSql = `
      INSERT INTO parking_details (
        fined, arrived, status, parkingDateString
      ) VALUES (?,?,?,?)
    `;
    const parkingDetailsId = db
      .prepare(parkingDetailsSql)
      .run([fined, arrived, status, parkingDateString])
      .lastInsertRowid as number;

    const carSql = `
      INSERT INTO car (
        vin, originPort, destinationPort, departureDate, arrivalDate, auction, createdAt, shipping, specifications_id, parking_details_id
      ) VALUES (?,?,?,?,?,?,?,?,?,?)
    `;
    db.prepare(carSql).run([
      vin,
      originPort,
      destinationPort,
      departureDate,
      arrivalDate,
      auction,
      createdAt,
      shipping,
      specificationsId,
      parkingDetailsId,
    ]);

    console.log(`Car with VIN ${vin} added successfully.`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to add car to database");
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
    revalidatePath(`/users/${userId}`);
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
      roleId: rows[0].role_id,
      cars: rows
        .filter((row) => row.vin !== null)
        .map((row) => ({
          vin: row.vin,
          arrivalDate: row.arrivalDate,
          destinationPort: row.destinationPort,
        })),
    };

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return undefined;
  }
}

export async function getCarsFromDatabase(): Promise<CarData[]> {
  try {
    const cars: CarData[] = await drizzleDb
      .select()
      .from(carTable)
      .leftJoin(
        specificationsTable,
        eq(carTable.specificationsId, specificationsTable.id),
      )
      .leftJoin(
        parkingDetailsTable,
        eq(carTable.parkingDetailsId, parkingDetailsTable.id),
      )
      .all();

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
): Promise<CarData | undefined> {
  try {
    const car: CarData = await drizzleDb
      .select()
      .from(carTable)
      .leftJoin(
        specificationsTable,
        eq(carTable.specificationsId, specificationsTable.id),
      )
      .leftJoin(
        parkingDetailsTable,
        eq(carTable.parkingDetailsId, parkingDetailsTable.id),
      )
      .where(eq(carTable.vin, vin))
      .limit(1)
      .get() as CarData;

    if (!car) {
      return undefined;
    }

    return car;
  } catch (e) {
    console.error(e);
  }
}

export async function getCarFromDatabaseByID(
  id: number,
): Promise<CarData | undefined> {
  try {
    const car: CarData = await drizzleDb
      .select()
      .from(carTable)
      .leftJoin(
        specificationsTable,
        eq(carTable.specificationsId, specificationsTable.id),
      )
      .leftJoin(
        parkingDetailsTable,
        eq(carTable.parkingDetailsId, parkingDetailsTable.id),
      )
      .where(eq(carTable.id, id))
      .limit(1)
      .get() as CarData;

    if (!car) {
      return undefined;
    }

    return car;
  } catch (e) {
    console.error(e);
  }
}
