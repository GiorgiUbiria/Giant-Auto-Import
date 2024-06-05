"use server";

import { CarData, User, UserWithCarsAndSpecs } from "@/lib/interfaces";
import { revalidatePath } from "next/cache";
import { db } from "../drizzle/db";
import {
  carTable,
  specificationsTable,
  parkingDetailsTable,
  userTable,
  userCarTable,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

type NewUserCar = typeof userCarTable.$inferInsert;
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

const insertUserCar = async (userCar: NewUserCar) => {
  return db.insert(userCarTable).values(userCar);
};

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

    const carInstance: CarData = (await getCarFromDatabaseByID(id)) as CarData;

    const pdId = carInstance.parking_details?.id;
    const spId = carInstance.specifications?.id;

    if (!pdId || !spId) {
      throw new Error("Car ID is required for update.");
    }

    const specificationsInstance = await db
      .select()
      .from(specificationsTable)
      .where(eq(specificationsTable.id, spId))
      .limit(1)
      .get();
    const parkingDetailsInstance = await db
      .select()
      .from(parkingDetailsTable)
      .where(eq(parkingDetailsTable.id, pdId))
      .limit(1)
      .get();

    if (!specificationsInstance || !parkingDetailsInstance) {
      throw new Error("Car ID is required for update.");
    }

    for (const [key, value] of Object.entries(carData)) {
      if (["vin", "originPort", "destinationPort", "shipping"].includes(key)) {
        await db
          .update(carTable)
          .set({ [key]: value })
          .where(eq(carTable.id, id));
      }
    }

    for (const [key, value] of Object.entries(carData)) {
      if (
        [
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
        ].includes(key)
      ) {
        await db
          .update(specificationsTable)
          .set({ [key]: value })
          .where(eq(specificationsTable.id, spId));
      }
    }

    for (const [key, value] of Object.entries(carData)) {
      if (["fined", "arrived", "status", "parkingDateString"].includes(key)) {
        await db
          .update(parkingDetailsTable)
          .set({ [key]: value })
          .where(eq(parkingDetailsTable.id, pdId));
      }
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

    const specifications: NewSpecification = {
      vin: vin,
      carfax: carfax || null,
      year: year || null,
      make: make || null,
      model: model || null,
      trim: trim || null,
      manufacturer: manufacturer || null,
      bodyType: bodyType || null,
      country: country || null,
      engineType: engineType || null,
      titleNumber: titleNumber || null,
      titleState: titleState || null,
      color: color || null,
      runndrive: fuelType || null,
    };

    const parkingDetails: NewParkingDetails = {
      fined: fined ? "true" : fined || null,
      arrived: arrived ? "true" : arrived || null,
      status: status || null,
      parkingDateString: parkingDateString || null,
    };

    const specificationsId = await insertSpecification(specifications);
    const parkingDetailsId = await insertParkingDetails(parkingDetails);

    const car: NewCar = {
      vin: vin,
      originPort: originPort || null,
      destinationPort: destinationPort || null,
      departureDate: departureDate || null,
      arrivalDate: arrivalDate || null,
      auction: auction || null,
      createdAt: createdAt?.toString() || null,
      shipping: shipping?.name?.toString() || null,
      specificationsId: specificationsId[0].specificationsId,
      parkingDetailsId: parkingDetailsId[0].parkingDetailsId,
    };

    await insertCar(car);

    console.log(`Car with VIN ${vin} added successfully.`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to add car to database");
  }
}

export async function removeCarFromDb(id: number): Promise<void> {
  try {
    const carId: { deletedId: number }[] = await db
      .delete(carTable)
      .where(eq(carTable.id, id))
      .returning({ deletedId: carTable.id });

    if (!carId[0].deletedId) {
      throw new Error("Car ID is required for remove.");
    }

    console.log(`Car with ID ${carId[0].deletedId} removed successfully.`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to remove car from database");
  }
}

export async function assignCarToUser(
  userId: string,
  formData: FormData,
): Promise<void> {
  const vin = formData.get("car_vin") as string;
  try {
    const car: CarData | undefined = await getCarFromDatabase(vin);

    if (!car) {
      throw new Error(`Car with VIN ${vin} not found`);
    }

    const carId: number = car.car.id;

    const userCar: NewUserCar = {
      carId: carId,
      userId: userId,
    };

    await insertUserCar(userCar);

    console.log(`Car with VIN ${vin} assigned to user with ID ${userId}`);
    revalidatePath(`/users/${userId}`);
  } catch (e) {
    console.error(e);
    throw new Error("Failed to assign car to user");
  }
}

export async function getUsers(): Promise<User[] | undefined> {
  try {
    const users: User[] = (await db.select().from(userTable).all()) as User[];

    if (users.length === 0) {
      console.warn("No users found");
      return undefined;
    }

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

export async function getUser(
  id: string,
): Promise<UserWithCarsAndSpecs | undefined> {
  try {
    const user: User = (await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id))
      .get()) as User;


    if (!user) {
      throw new Error("No user found");
    }

    const cars: CarData[] = await getCarsFromDatabaseForUser(user.id);

    const userWithCarsAndSpecs: UserWithCarsAndSpecs = {
      user: user,
      cars: cars,
    };

    return userWithCarsAndSpecs;
  } catch (error) {
    console.error("Error fetching user:", error);
    return undefined;
  }
}

export async function getCarsFromDatabase(): Promise<CarData[]> {
  try {
    const cars: CarData[] = await db
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

export async function getCarsFromDatabaseForUser(
  id: string,
): Promise<CarData[]> {
  try {
    const cars: CarData[] = await db
      .select()
      .from(userCarTable)
      .innerJoin(
        carTable,
        eq(userCarTable.carId, carTable.id),
      )
      .leftJoin(
        specificationsTable,
        eq(carTable.specificationsId, specificationsTable.id),
      )
      .leftJoin(
        parkingDetailsTable,
        eq(carTable.parkingDetailsId, parkingDetailsTable.id),
      )
      .where(eq(userCarTable.userId, id))
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
    const car: CarData = (await db
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
      .get()) as CarData;

    if (!car) {
      console.log("No car found");
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
    const car: CarData = (await db
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
      .get()) as CarData;

    if (!car) {
      return undefined;
    }

    return car;
  } catch (e) {
    console.error(e);
  }
}
