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
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-xl">
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
        <div className="grid gap-12">
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-4xl">Tracking Info:</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Order Created: </p>
                <p className="text-xl text-primary">
                  {" "}
                  {carData.car.createdAt
                    ? formatDateToInputValue(carData.car.createdAt)
                    : "-"}{" "}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Pick Up Date: </p>
                <p className="text-xl text-primary">
                  {" "}
                  {carData.car.createdAt
                    ? formatDateToInputValue(carData.car.createdAt)
                    : "-"}{" "}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary">
                  {" "}
                  Delivered To Warehouse:{" "}
                </p>
                <p className="text-xl text-primary">
                  {" "}
                  {carData.car.createdAt
                    ? formatDateToInputValue(carData.car.createdAt)
                    : "-"}{" "}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary">
                  {" "}
                  Estimated Departure Date:{" "}
                </p>
                <p className="text-xl text-primary">
                  {" "}
                  {carData.car.departureDate
                    ? formatDateToInputValue(carData.car.departureDate)
                    : "-"}{" "}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary">
                  {" "}
                  Estimated Arrival Date:{" "}
                </p>
                <p className="text-xl text-primary">
                  {" "}
                  {carData.car.arrivalDate
                    ? formatDateToInputValue(carData.car.arrivalDate)
                    : "-"}{" "}
                </p>
              </div>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-4xl">Shipping Info:</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Body Type: </p>
                <p className="text-xl text-primary">
                  {" "}
                  {carData.specifications?.bodyType
                    ? carData.specifications?.bodyType
                    : "-"}{" "}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Fuel Type: </p>
                <p className="text-xl text-primary">
                  {" "}
                  {carData.specifications?.fuelType
                    ? carData.specifications?.fuelType
                    : "-"}{" "}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Vehicle Status: </p>
                <p className="text-xl text-primary">
                  {" "}
                  {carData.parking_details?.status
                    ? carData.parking_details?.status
                    : "-"}{" "}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Booking #: </p>
                <p className="text-xl text-primary">
                  {" "}
                  {carData.parking_details?.bookingNumber
                    ? carData.parking_details?.bookingNumber
                    : "-"}{" "}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Container #: </p>
                <p className="text-xl text-primary">
                  {" "}
                  {carData.parking_details?.containerNumber
                    ? carData.parking_details?.containerNumber
                    : "-"}{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
