import CopyToClipBoard from "./copy-to-clipboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CarData } from "@/lib/interfaces";
import { Truck } from "lucide-react";
import Link from "next/link";

function formatDateToInputValue(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CarInfo({ carData }: { carData: CarData }) {
  return (
    <Card className="overflow-hidden lg:w-1/2">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            VIN - {carData.car.vin}
            <CopyToClipBoard text={carData.car.vin!} />
          </CardTitle>
          <CardDescription>
            Date: {carData.car?.arrivalDate?.toString()}
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Truck className="h-3.5 w-3.5" />
            <Link
              href={
                carData.parking_details?.trackingLink
                  ? carData.parking_details?.trackingLink
                  : ""
              }
            >
              Track Car
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="font-semibold text-lg">Details</div>
          <Separator className="my-2" />
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-make"> Make: </Label>
              <Input
                type="text"
                value={carData.specifications?.make!}
                readOnly
                id="car-make"
              />
            </div>
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-year"> Year: </Label>
              <Input
                type="text"
                value={carData.specifications?.year!}
                readOnly
                id="car-year"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-container-number"> Container #: </Label>
              <Input
                type="text"
                value={
                  carData.parking_details?.containerNumber
                    ? carData.parking_details?.containerNumber
                    : "-"
                }
                readOnly
                id="car-container-number"
              />
            </div>
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-booking-number"> Booking #: </Label>
              <Input
                type="text"
                value={
                  carData.parking_details?.bookingNumber
                    ? carData.parking_details?.bookingNumber
                    : "-"
                }
                readOnly
                id="car-booking-number"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-model"> Model: </Label>
              <Input
                type="text"
                value={carData.specifications?.model ? carData.specifications?.model : "-"}
                readOnly
                id="car-model"
              />
            </div>
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-color"> Color: </Label>
              <Input
                type="text"
                value={carData.specifications?.color ? carData.specifications?.color : "-"} 
                readOnly
                id="car-model"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-departure-date"> Departure Date:: </Label>
              <Input
                type="text"
                value={
                  carData.car.departureDate
                    ? formatDateToInputValue(carData.car.departureDate)
                    : "-"
                }
                readOnly
                id="car-departure-date"
              />
            </div>
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-arrival-date"> Arrival Date:: </Label>
              <Input
                type="text"
                value={
                  carData.car.arrivalDate
                    ? formatDateToInputValue(carData.car.arrivalDate)
                    : "-"
                }
                readOnly
                id="car-arrival-date"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-body-type"> Body Type: </Label>
              <Input
                type="text"
                value={
                  carData.specifications?.bodyType
                    ? carData.specifications?.bodyType
                    : "-"
                }
                readOnly
                id="car-body-type"
              />
            </div>
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-fuel-type"> Fuel Type: </Label>
              <Input
                type="text"
                value={
                  carData.specifications?.fuelType
                    ? carData.specifications?.fuelType
                    : "-"
                }
                readOnly
                id="car-fuel-type"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
