import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { selectCarSchema } from "@/lib/drizzle/schema";
import { Truck } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import CopyToClipBoard from "@/components/copy-to-clipboard";

const SelectSchema = selectCarSchema.omit({ destinationPort: true });
type Props = {
  car: z.infer<typeof SelectSchema>
}

function formatDateToInputValue(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CarInfo({ car }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-gray-300 dark:bg-gray-700">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-xl">
            <div>
              <h2 className="text-2xl"> {car.make + "   " + car.model} </h2>
              <div className="flex gap-2 items-center">
                VIN - {car.vin}
                <CopyToClipBoard text={car.vin} />
              </div>
            </div>
          </CardTitle>
        </div>
        <div className="ml-auto flex items-center gap-1 mr-6">
          {car.trackingLink &&
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <Truck className="h-3.5 w-3.5" />
              <Link href={car.trackingLink}>
                Track Car
              </Link>
            </Button>
          }
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <div className="grid gap-12">
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-4xl">Tracking Info:</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Purchase Date: </p>
                <p className="text-xl text-primary mr-8">
                  {formatDateToInputValue(car.purchaseDate)}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Estimated Departure Date: </p>
                <p className="text-xl text-primary mr-8">
                  {car.departureDate
                    ? formatDateToInputValue(car.departureDate)
                    : "-"
                  }
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Estimated Arrival Date: </p>
                <p className="text-xl text-primary mr-8">
                  {car.arrivalDate
                    ? formatDateToInputValue(car.arrivalDate)
                    : "-"
                  }
                </p>
              </div>
            </div>
          </div>
          <Separator className="my-2 w-full" />
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-4xl">Shipping Info:</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Body Type: </p>
                <p className="text-xl text-primary mr-8">
                  {car.bodyType
                    ? car.bodyType
                    : "-"
                  }
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Fuel Type: </p>
                <p className="text-xl text-primary mr-8">
                  {car.fuelType
                    ? car.fuelType
                    : "-"
                  }
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Booking #: </p>
                <p className="text-xl text-primary mr-8">
                  {car.bookingNumber
                    ? car.bookingNumber
                    : "-"
                  }
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xl text-primary"> Container #: </p>
                <p className="text-xl text-primary mr-8">
                  {car.containerNumber
                    ? car.containerNumber
                    : "-"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
