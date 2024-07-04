export interface APICar {
  id: string;
  vin: string;
  location: string | null;
  specifications: APISpecifications | null;
  parkingDetails: APIParkingDetails | null;
  papers: APIPapers | null;
  shipment: APIShipment | null;
  notes: APINotes | null;
  shipping: APIShipping | null;
  auction: APIAuction | null;
  additional: APIAdditional | null;
  createdAt: string;
}

interface APISpecifications {
  vin: string;
  carfax: string | null;
  description: string;
  year: string;
  make: string;
  model: string;
  vehicleClass: string;
  type: string;
  bodyType: string;
  country: string;
  engineType: string;
  titleNumber: string;
  titleState: string;
  color: string | null;
  runndrive: boolean;
  fuelType: string;
  primaryFuelType: string;
  secondaryFuelType: string | null;
}

interface APIParkingDetails {
  fined: boolean | string | null;
  arrived: boolean | string | null;
  inspected: boolean | string | null;
  status: string;
  lot: string | null;
  parkingDate: string;
  updatedAt: string;
}

interface APIPapers {
  title: string | null;
  billOfSale: string | null;
  invoice: string | null;
  inspection: string;
  inspectionSet: boolean;
  titleSet: boolean;
  billOfSaleSet: boolean;
}

interface APIShipment {
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

interface APINotes {
  customerNotes: string | null;
  mtlNotes: string;
}

interface APIShipping {
  name: string;
  presented: boolean;
}

interface APIAuction {
  name: string;
  location: string | null;
  portOfDelivery: string;
  purchaseDate: string | null;
  purchasePrice: number | null;
  terminal: string | null;
  portOfDischarge: string;
  placeOfDelivery: string | null;
  lotNumber: string | null;
  vehicleLotPurchase: string;
  paymentDate: string | null;
  buyer: APIBuyer;
}

interface APIBuyer {
  name: string;
  number: string;
}

interface APIAdditional {
  keys01: string;
}

export interface APICarResponse {
  data: APICar[];
}
