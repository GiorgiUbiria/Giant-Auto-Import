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
import { DbCar } from "@/lib/interfaces";
import { Truck } from "lucide-react";

export default function CarInfo({ carData }: { carData: DbCar }) {
  return (
    <Card className="overflow-hidden w-1/2">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            VIN - {carData.vin}
            <CopyToClipBoard text={carData?.vin!} />
          </CardTitle>
          <CardDescription>Date: {carData.parkingDateString}</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Truck className="h-3.5 w-3.5" />
            <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
              Track Car
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="font-semibold text-lg">Details</div>
          <Separator className="my-2" />
          <div className="flex gap-2">
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-make"> Make: </Label>
              <Input type="text" value={carData.make!} readOnly id="car-make" />
            </div>
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-year"> Year: </Label>
              <Input
                type="text"
                value={carData.carfax!}
                readOnly
                id="car-year"
              />
            </div>
          </div>
          <div className="flex flex-col align-start gap-2">
            <Label htmlFor="car-description"> Description: </Label>
            <Input
              type="text"
              value={carData.year!}
              readOnly
              id="car-description"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-trim"> Trim: </Label>
              <Input type="text" value={carData.trim!} readOnly id="car-trim" />
            </div>
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-model"> Model: </Label>
              <Input
                type="text"
                value={carData.model!}
                readOnly
                id="car-model"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-title-number"> Title Number: </Label>
              <Input
                type="text"
                value={carData.titleNumber! ? carData.titleNumber! : "-"}
                readOnly
                id="car-title-number"
              />
            </div>
            <div className="flex flex-col align-start gap-2">
              <Label htmlFor="car-country"> Country: </Label>
              <Input
                type="text"
                value={carData.country!}
                readOnly
                id="car-country"
              />
            </div>
          </div>
          <div className="flex flex-col align-start gap-2">
            <Label htmlFor="car-engine-type"> Engine Type: </Label>
            <Input
              type="text"
              value={carData.engineType!}
              readOnly
              id="car-engine-type"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
