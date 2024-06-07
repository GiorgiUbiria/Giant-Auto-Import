interface Specifications {
  id: number;
  vin: string | null;
  carfax: string | null; // Allow carfax to be null
  year: string | null; // Allow year to be null
  make: string | null; // Allow make to be null
  model: string | null; // Allow model to be null
  trim: string | null; // Allow trim to be null
  manufacturer: string | null; // Allow manufacturer to be null
  bodyType: string | null; // Allow bodyType to be null
  country: string | null; // Allow country to be null
  engineType: string | null; // Allow engineType to be null
  titleNumber: string | null; // Allow titleNumber to be null
  titleState: string | null; // Allow titleState to be null
  color: string | null; // Allow color to be null
  runndrive: string | null; // Allow runndrive to be null
  fuelType: string | null;
}

interface ParkingDetails {
  id: number;
  fined: string | null;
  arrived: string | null; // Allow arrived to be null
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

export type CarData = {
  car: Car;
  specifications: Specifications | null;
  parking_details: ParkingDetails | null;
  images?: string[];
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
