"use server";

import { CarData, Note, User, UserWithCarsAndSpecs } from "@/lib/interfaces";
import { revalidatePath } from "next/cache";
import { db } from "../drizzle/db";
import {
  carTable,
  specificationsTable,
  parkingDetailsTable,
  userTable,
  userCarTable,
  imageTable,
  priceTable,
  priceCurrencyTable,
  transactionTable,
  noteTable,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

type NewUserCar = typeof userCarTable.$inferInsert;

const insertUserCar = async (userCar: NewUserCar) => {
  return db.insert(userCarTable).values(userCar);
};

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
    const users: User[] = (await db
      .select()
      .from(userTable)
      .where(eq(userTable.roleId, 1))
      .all()) as User[];

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
    const cars = (await db
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
      .leftJoin(priceTable, eq(carTable.id, priceTable.carId))
      .leftJoin(
        priceCurrencyTable,
        eq(priceTable.currencyId, priceCurrencyTable.id),
      )
      .leftJoin(transactionTable, eq(carTable.id, transactionTable.carId))
      .all()) as CarData[];

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
    const cars: CarData[] = (await db
      .select()
      .from(userCarTable)
      .innerJoin(carTable, eq(userCarTable.carId, carTable.id))
      .leftJoin(
        specificationsTable,
        eq(carTable.specificationsId, specificationsTable.id),
      )
      .leftJoin(
        parkingDetailsTable,
        eq(carTable.parkingDetailsId, parkingDetailsTable.id),
      )
      .leftJoin(priceTable, eq(carTable.id, priceTable.carId))
      .leftJoin(
        priceCurrencyTable,
        eq(priceTable.currencyId, priceCurrencyTable.id),
      )
      .leftJoin(transactionTable, eq(carTable.id, transactionTable.carId))
      .where(eq(userCarTable.userId, id))
      .all()) as CarData[];

    if (cars.length === 0) {
      throw new Error("No cars found");
    }

    return cars;
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
}

function isValidImage(image: {
  id: number;
  carVin: string | null;
  imageUrl: string | null;
  imageType: string | null;
}): image is {
  id: number;
  carVin: string | null;
  imageUrl: string;
  imageType: "Arrival" | "Container";
} {
  return (
    image.imageUrl !== null &&
    (image.imageType === "Arrival" || image.imageType === "Container")
  );
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
      .leftJoin(priceTable, eq(carTable.id, priceTable.carId))
      .leftJoin(
        priceCurrencyTable,
        eq(priceTable.currencyId, priceCurrencyTable.id),
      )
      .leftJoin(transactionTable, eq(carTable.id, transactionTable.carId))
      .where(eq(carTable.vin, vin))
      .limit(1)
      .get()) as CarData;

    if (!car) {
      console.log("No car found");
    }

    const images = await db
      .select()
      .from(imageTable)
      .where(eq(imageTable.carVin, vin))
      .all();

    if (images.length === 0) {
      console.log(`No images found for VIN: ${vin}`);
    }

    car.images = images.filter(isValidImage).map((image) => ({
      imageUrl: image.imageUrl!,
      imageType: image.imageType as "Arrival" | "Container",
    }));

    const notes = await db
      .select()
      .from(noteTable)
      .where(eq(noteTable.carId, car.car.id))
      .all();

    car.note = notes;

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
      .leftJoin(priceTable, eq(carTable.id, priceTable.carId))
      .leftJoin(
        priceCurrencyTable,
        eq(priceTable.currencyId, priceCurrencyTable.id),
      )
      .leftJoin(transactionTable, eq(carTable.id, transactionTable.carId))
      .where(eq(carTable.id, id))
      .limit(1)
      .get()) as CarData;

    if (!car) {
      return undefined;
    }

    const notes = await db
      .select()
      .from(noteTable)
      .where(eq(noteTable.carId, id))
      .all();

    car.note = notes;

    return car;
  } catch (e) {
    console.error(e);
  }
}
