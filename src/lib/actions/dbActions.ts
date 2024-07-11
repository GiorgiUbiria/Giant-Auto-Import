"use server";

import {
  CarData,
  Image,
  Note,
  Transaction,
  UserWithCarsAndSpecs,
} from "@/lib/interfaces";
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
  transactionTable,
  noteTable,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ActionResult } from "../form";
import { getImagesFromBucket } from "./bucketActions";

export type DbUser = typeof userTable.$inferSelect;

type NewUserCar = typeof userCarTable.$inferInsert;

export type DbImage = typeof imageTable.$inferSelect.imageType;

const insertUserCar = async (userCar: NewUserCar) => {
  return db.insert(userCarTable).values(userCar);
};

const updateUserCar = async (userCar: NewUserCar) => {
  return db
    .update(userCarTable)
    .set(userCar)
    .where(eq(userCarTable.carId, userCar.carId!));
};

export async function assignCarToUser(
  userId: string,
  carVin: string,
): Promise<ActionResult> {
  try {
    const car: CarData | undefined = await getCarFromDatabase(carVin);

    if (!car) {
      return {
        error: `Car with VIN ${carVin} not found`,
      };
    }

    const carId: number = car.car.id;

    const userCar: NewUserCar = {
      carId: carId,
      userId: userId,
    };

    const [alreadyAssigned] = await db
      .select()
      .from(userCarTable)
      .where(eq(userCarTable.carId, carId));

    if (alreadyAssigned) {
      await updateUserCar(userCar);
    } else {
      await insertUserCar(userCar);
    }

    console.log(`Car with VIN ${carVin} assigned to user with ID ${userId}`);
    revalidatePath(`/users/${userId}`);

    return {
      success: "Car assigned to user",
      error: null,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "Failed to assign car to user",
    };
  }
}

export async function getUsers(): Promise<DbUser[] | undefined> {
  try {
    const users: DbUser[] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.roleId, 1));

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
    const user: DbUser = (
      await db.select().from(userTable).where(eq(userTable.id, id))
    )[0] as DbUser;

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

export async function getCarsFromDatabaseForTables(): Promise<CarData[]> {
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
      .leftJoin(priceTable, eq(carTable.id, priceTable.carId))) as CarData[];

    if (cars.length === 0) {
      throw new Error("No cars found");
    }

    const updatedCars = await Promise.all(
      cars.map(async (car) => {
        const transactions = (await db
          .select()
          .from(transactionTable)
          .where(eq(transactionTable.carId, car.car.id))) as Transaction[];

        car.transaction = transactions;

        const notes = (await db
          .select()
          .from(noteTable)
          .where(eq(noteTable.carId, car.car.id))) as Note[];

        car.note = notes;

        const dbImages = (await db
          .select()
          .from(imageTable)
          .where(eq(imageTable.carVin, car.car.vin!))
          .limit(1)) as Image[];

        const bucketImages = await getImagesFromBucket(car.car.vin!);

        let images;
        if (dbImages.length > 0) {
          images = dbImages.map((image) => ({
            imageUrl: image.imageUrl,
            imageType: image.imageType as DbImage,
          }));
        } else {
          images = bucketImages.map((image) => ({
            imageUrl: image.imageUrl,
            imageType: image.imageType as DbImage,
          }));
        }

        car.images = images.slice(0, 1);
        return car;
      }),
    );

    return updatedCars;
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
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
      .leftJoin(priceTable, eq(carTable.id, priceTable.carId))) as CarData[];

    if (cars.length === 0) {
      throw new Error("No cars found");
    }

    const updatedCars = await Promise.all(
      cars.map(async (car) => {
        const transactions = (await db
          .select()
          .from(transactionTable)
          .where(eq(transactionTable.carId, car.car.id))) as Transaction[];

        car.transaction = transactions;

        const notes = (await db
          .select()
          .from(noteTable)
          .where(eq(noteTable.carId, car.car.id))) as Note[];

        car.note = notes;

        const dbImages = (await db
          .select()
          .from(imageTable)
          .where(eq(imageTable.carVin, car.car.vin!))) as Image[];

        const bucketImages = await getImagesFromBucket(car.car.vin!);

        const images = [...dbImages, ...bucketImages].map((image) => ({
          imageUrl: image.imageUrl,
          imageType: image.imageType as DbImage,
        }));

        car.images = images;
        return car;
      }),
    );

    return updatedCars;
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
      .where(eq(userCarTable.userId, id))) as CarData[];

    if (cars.length === 0) {
      throw new Error("No cars found");
    }

    const updatedCars = await Promise.all(
      cars.map(async (car) => {
        const transactions = (await db
          .select()
          .from(transactionTable)
          .where(eq(transactionTable.carId, car.car.id))) as Transaction[];

        car.transaction = transactions;

        const notes = (await db
          .select()
          .from(noteTable)
          .where(eq(noteTable.carId, car.car.id))) as Note[];

        car.note = notes;

        const dbImages = (await db
          .select()
          .from(imageTable)
          .where(eq(imageTable.carVin, car.car.vin!))) as Image[];

        const bucketImages = await getImagesFromBucket(car.car.vin!);

        const images = [...dbImages, ...bucketImages].map((image) => ({
          imageUrl: image.imageUrl,
          imageType: image.imageType as DbImage,
        }));

        car.images = images;
        return car;
      }),
    );

    return updatedCars;
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
      .leftJoin(priceTable, eq(carTable.id, priceTable.carId))
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

    car.images = images.map((image) => ({
      imageUrl: image.imageUrl!,
      imageType: image.imageType as DbImage,
    }));

    const transactions = (await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.carId, car.car.id))
      .all()) as Transaction[];

    const notes = await db
      .select()
      .from(noteTable)
      .where(eq(noteTable.carId, car.car.id))
      .all();

    car.note = notes;
    car.transaction = transactions;

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
      .where(eq(carTable.id, id))
      .limit(1)
      .get()) as CarData;

    if (!car) {
      return undefined;
    }

    const transactions = (await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.carId, id))
      .all()) as Transaction[];

    car.transaction = transactions;

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
