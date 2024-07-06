import { DbImage, DbUser } from "./actions/dbActions";
import { carTable, specificationsTable, parkingDetailsTable } from "./drizzle/schema";

export interface Specifications {
  id: number;
  vin: string | null;
  carfax: string | null;
  year: string | null;
  make: string | null;
  model: string | null;
  bodyType: typeof specificationsTable.$inferSelect["bodyType"];
  color: string | null;
  fuelType: typeof specificationsTable.$inferSelect["fuelType"]; 
}

export interface ParkingDetails {
  id: number;
  containerNumber: string | null;
  bookingNumber: string | null;
  trackingLink: string | null;
  status: typeof parkingDetailsTable.$inferSelect["status"];
}

export interface Car {
  id: number;
  vin: string | null;
  originPort: string | null;
  destinationPort: string | null;
  departureDate: Date | null;
  arrivalDate: Date | null;
  auction: string | null;
  createdAt: Date | null;
  specificationsId: number | null;
  parkingDetailsId: number | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  password?: string;
  customId?: string;
  roleId: number;
}

export interface UserCar {
  carId: number | null;
  userId: string | null;
}

export type Image = {
  imageUrl: string | null;
  imageType?: DbImage;
}

export type Transaction = {
  priceId: number | null;
  userId: number | null;
  carId: number | null;
  amount: number | null;
  paymentDate: string | null;
}

export type Note = {
  id: number;
  userId: string | null;
  carId: number | null;
  note: string | null;
  createdAt: Date | null;
}

export type CarData = {
  car: Car;
  specifications: Specifications | null;
  parking_details: ParkingDetails | null;
  price?: { id?: number; totalAmount: number; amountLeft?: number } | null;
  transaction?: Transaction[] | null;
  images?: Image[];
  note?: Note[];
};

export type UserWithCarsAndSpecs = {
  user: DbUser;
  user_car?: UserCar;
  cars?: CarData[];
};

export interface CarResponse {
  data: CarData[];
}

export interface APIAssets {
  type: string;
  source: string;
  value: string;
  name?: string;
}

export interface APIAssetsResponse {
  shipping: string;
  assets: APIAssets[];
}

export interface GalleryImage {
  imgelink: string;
}

export type CarStatus = "Pending" | "InTransit" | "OnHand" | "Loaded" | "Fault";
