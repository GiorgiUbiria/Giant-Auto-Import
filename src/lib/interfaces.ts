interface Specifications {
  id: number;
  vin: string | null;
  carfax: string | null;
  year: string | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  manufacturer: string | null;
  bodyType: string | null;
  country: string | null;
  engineType: string | null;
  titleNumber: string | null;
  titleState: string | null;
  color: string | null;
  runndrive: string | null;
  fuelType: string | null;
}

interface ParkingDetails {
  id: number;
  fined: string | null;
  arrived: string | null;
  status: string | null;
  parkingDateString: string | null;
}

interface Car {
  id: number;
  vin: string | null;
  originPort: string | null;
  destinationPort: string | null;
  departureDate: string | null;
  arrivalDate: string | null;
  auction: string | null;
  createdAt: string | null;
  shipping: string | null;
  specificationsId: number | null;
  parkingDetailsId: number | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: number;
}

export interface UserCar {
  carId: number | null;
  userId: string | null;
}

export type Image = {
  imageUrl: string | null;
  imageType?: "Arrival" | "Container";
}

export type Transaction = {
  priceId: number | null;
  userId: number | null;
  carId: number | null;
  paymentDate: string | null;
}

export type CarData = {
  car: Car;
  specifications: Specifications | null;
  parking_details: ParkingDetails | null;
  price?: number | null;
  price_currency?: string | null;
  transaction?: Transaction | null;
  images?: Image[];
};

export type UserWithCarsAndSpecs = {
  user: User;
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

export type Currency = "USD" | "EUR" | "GEL"
