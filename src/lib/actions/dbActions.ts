import { DatabaseUser, db } from "@/lib/db";
import {
  DbCar,
  UserWithCar,
} from "@/lib/interfaces";
import { revalidatePath } from "next/cache";

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
