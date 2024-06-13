"use server";

import {
  CarData,
  CarStatus,
  User,
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
  priceCurrencyTable,
  transactionTable,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";
import countries from "../../../public/countries.json";
import { ActionResult } from "next/dist/server/app-render/types";

type NewUserCar = typeof userCarTable.$inferInsert;
type NewCar = typeof carTable.$inferInsert;
type NewSpecification = typeof specificationsTable.$inferInsert;
type NewParkingDetails = typeof parkingDetailsTable.$inferInsert;
type NewPrice = typeof priceTable.$inferInsert;

enum CarStatusEnum {
  Pending = "Pending",
  InTransit = "InTransit",
  OnHand = "OnHand",
  Loaded = "Loaded",
  Fault = "Fault",
}

const insertCar = async (car: NewCar) => {
  return db.insert(carTable).values(car).returning({ carId: carTable.id });
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

const insertPrice = async (price: NewPrice) => {
  return db
    .insert(priceTable)
    .values(price)
    .returning({ priceId: priceTable.id });
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

export async function addCarToDb(
  _: any,
  formData: FormData,
): Promise<ActionResult | undefined> {
  try {
    const convertFormData = (key: string, defaultValue: any = null) => {
      const value = formData.get(key);

      if (typeof defaultValue === "boolean") {
        return value === "true" ? 1 : 0;
      } else if (typeof defaultValue === "string") {
        return value?.toString() ?? defaultValue;
      } else if (defaultValue instanceof Date) {
        let dateValue: Date | null = null;
        if (typeof value === "string") {
          dateValue = new Date(value);
        }

        if (dateValue !== null && !isNaN(dateValue.getTime())) {
          return dateValue;
        } else {
          return defaultValue;
        }
      } else if (typeof defaultValue === "number") {
        return value ? Number(value) : defaultValue;
      } else {
        return value ?? defaultValue;
      }
    };

    const vin = convertFormData("vin");
    if (!vin || !(vin.length < 50 && vin.length > 6)) {
      return { error: "VIN is required" };
    }
    const carfax = convertFormData("carfax");
    if (!carfax || !(carfax.length < 50 && carfax.length > 6)) {
      return { error: "Carfax is required" };
    }
    const year = convertFormData("year", 0);
    if (!year || year < 1900 || year > new Date().getFullYear()) {
      return {
        error: "Year is required and must be between 1900 and Current Year",
      };
    }
    const make = convertFormData("make");
    if (!make || !(make.length < 50 && make.length > 6)) {
      return { error: "Make is required" };
    }
    const model = convertFormData("model");
    if (!model || !(model.length < 50 && model.length > 6)) {
      return { error: "Model is required" };
    }
    const trim = convertFormData("trim");
    if (!trim || !(trim.length < 50 && trim.length > 6)) {
      return { error: "Trim is required" };
    }
    const manufacturer = convertFormData("manufacturer");
    if (
      !manufacturer ||
      !(manufacturer.length < 50 && manufacturer.length > 6)
    ) {
      return { error: "Manufacturer is required" };
    }
    const bodyType = convertFormData("bodyType");
    if (!bodyType || !(bodyType.length < 50 && bodyType.length > 6)) {
      return { error: "Body Type is required" };
    }
    const country = convertFormData("country");
    if (!country || !countries.some((c) => c.name === country)) {
      return { error: "Country is required" };
    }
    const engineType = convertFormData("engineType");
    if (!engineType || engineType.length < 50 || engineType.length > 100) {
      return { error: "Engine Type is required" };
    }
    const titleNumber = convertFormData("titleNumber");
    if (!titleNumber || titleNumber.length < 50 || titleNumber.length > 100) {
      return { error: "Title Number is required" };
    }
    const titleState = convertFormData("titleState");
    if (!titleState || titleState.length < 50 || titleState.length > 100) {
      return { error: "Title State is required" };
    }
    const color = convertFormData("color");
    if (!color || color.length < 50 || color.length > 100) {
      return { error: "Color is required" };
    }
    const fuelType = convertFormData("fuelType");
    if (!fuelType || fuelType.length < 50 || fuelType.length > 100) {
      return { error: "Fuel Type is required" };
    }

    const fined = convertFormData("fined", false);
    if (!fined) {
      return { error: "Fined is required" };
    }
    const arrived = convertFormData("arrived", false);
    if (!arrived) {
      return { error: "Arrived is required" };
    }
    const status = convertFormData("status", "Pending" as CarStatus);
    if (!status || Object.values(CarStatusEnum).includes(status)) {
      return { error: "Status is required" };
    }
    const parkingDateString = convertFormData("parkingDateString");
    if (!parkingDateString || new Date(parkingDateString).getTime() === 0) {
      return { error: "Parking Date String is required" };
    }

    const originPort = convertFormData("originPort");
    if (!originPort || originPort.length < 50 || originPort.length > 100) {
      return { error: "Origin Port is required" };
    }
    const destinationPort = convertFormData("destinationPort");
    if (
      !destinationPort ||
      destinationPort.length < 50 ||
      destinationPort.length > 100
    ) {
      return { error: "Destination Port is required" };
    }
    const departureDateValue = formData.get("departureDate");
    if (!departureDateValue) {
      return { error: "Departure Date is required" };
    }
    const arrivalDateValue = formData.get("arrivalDate");
    if (!arrivalDateValue) {
      return { error: "Arrival Date is required" };
    }
    const createdAtValue = formData.get("createdAt");
    if (!createdAtValue) {
      return { error: "Created At is required" };
    }
    const auction = convertFormData("auction");
    if (!auction) {
      return { error: "Auction is required" };
    }
    const shipping = convertFormData("shipping");
    if (!shipping) {
      return { error: "Shipping is required" };
    }

    const price = convertFormData("price", 0);
    if (!price || price < 0) {
      return { error: "Price is required" };
    }
    const priceCurrency = convertFormData("priceCurrency", 0);
    if (!priceCurrency || priceCurrency < 1 || priceCurrency > 3) {
      return { error: "Price Currency is required" };
    }

    const departureDate =
      typeof departureDateValue === "string"
        ? new Date(departureDateValue)
        : null;
    const arrivalDate =
      typeof arrivalDateValue === "string" ? new Date(arrivalDateValue) : null;
    const createdAt =
      typeof createdAtValue === "string" ? new Date(createdAtValue) : null;

    const specifications: NewSpecification = {
      vin: vin,
      carfax: carfax,
      year: year,
      make: make,
      model: model,
      trim: trim,
      manufacturer: manufacturer,
      bodyType: bodyType,
      country: country,
      engineType: engineType,
      titleNumber: titleNumber,
      titleState: titleState,
      color: color,
      runndrive: fuelType,
    };

    const parkingDetails: NewParkingDetails = {
      fined: fined,
      arrived: arrived,
      status: status,
      parkingDateString: parkingDateString,
    };

    const specificationsId = await insertSpecification(specifications);
    const parkingDetailsId = await insertParkingDetails(parkingDetails);

    const car: NewCar = {
      vin: vin,
      originPort: originPort,
      destinationPort: destinationPort,
      departureDate: departureDate,
      arrivalDate: arrivalDate,
      createdAt: createdAt,
      auction: auction,
      shipping: shipping,
      specificationsId: specificationsId[0].specificationsId,
      parkingDetailsId: parkingDetailsId[0].parkingDetailsId,
    };

    const carId = await insertCar(car);

    const newPrice: NewPrice = {
      totalAmount: price as number,
      currencyId: priceCurrency as number,
      carId: carId[0].carId,
    };

    await insertPrice(newPrice);

    console.log(`Car with VIN ${vin} added successfully.`);

    return {
      error: null,
      success: "Car added successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to add car to database",
      success: null,
    }
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
