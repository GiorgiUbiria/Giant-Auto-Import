interface Specifications {
  vin: string;
  carfax: string;
  description: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  vehicleClass: string;
  type: string;
  manufacturer: string;
  bodyType: string;
  country: string;
  engineType: string;
  titleNumber: string;
  titleState: string;
  color: string | null;
  runndrive: boolean;
  fuelType: string | null;
  primaryFuelType: string | null;
  secondaryFuelType: string | null;
}

interface ParkingDetails {
  fined: boolean;
  arrived: boolean;
  inspected: boolean;
  status: string;
  lot: string | null;
  parkingDate: string;
  parkingDateString: string;
  updatedAt: string;
}

interface Papers {
  title: string;
  billOfSale: string | null;
  invoice: string | null;
  inspection: string;
  inspectionSet: boolean;
  titleSet: boolean;
  billOfSaleSet: boolean;
}

interface Shipment {
  container: string | null;
  name: string | null;
  booking: string | null;
  originPort: string;
  destinationPort: string;
  waybillOut: string | null;
  masterWaybillOut: string | null;
  carrierOut: string | null;
  vehicleIds: string[];
  arrivalDate: string | null;
  departureDate: string | null;
  receipt: string | null;
}

interface Notes {
  customerNotes: string | null;
  mtlNotes: string;
}

interface Shipping {
  name: string;
  presented: boolean;
}

interface Additional {
  keys01: string;
}

interface CarData {
  id: string;
  vin: string;
  location: string;
  specifications: Specifications;
  parkingDetails: ParkingDetails;
  papers: Papers;
  shipment: Shipment;
  notes: Notes;
  shipping: Shipping;
  auction: string | null;
  additional: Additional;
  createdAt: string;
}

export interface CarResponse {
  data: CarData[];
}
