import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { selectCarSchema } from "@/lib/drizzle/schema";
import { Calendar, Car, Fuel, Hash, Package, BadgeDollarSign, Truck as TruckIcon, Container as ContainerIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { z } from "zod";
import CopyToClipBoard from "@/components/copy-to-clipboard";
import { motion } from "framer-motion";

const SelectSchema = selectCarSchema.omit({ destinationPort: true });
type Props = {
  car: z.infer<typeof SelectSchema>,
  className?: string
}

function formatDateToInputValue(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CarInfo({ car, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
    >
      <Card className={"overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700/60 rounded-2xl " + (className || "") }>
        <CardHeader className="flex flex-col sm:flex-row items-start bg-transparent p-4 sm:p-6 border-b border-gray-700/60">
          <div className="grid gap-0.5 mb-4 sm:mb-0">
            <CardTitle className="group flex items-center gap-2 text-xl">
              <div>
                <h2 className="text-2xl sm:text-3xl flex items-center gap-2 text-white font-bold tracking-wide"> <Car className="inline-block w-7 h-7 text-primary" /> {car.make + " " + car.model} </h2>
                <div className="flex gap-2 items-center mt-1">
                  <Badge variant="outline" className="text-xs font-mono text-gray-200 border-gray-500 bg-gray-800/60">VIN: {car.vin}</Badge>
                  <CopyToClipBoard text={car.vin} />
                </div>
              </div>
            </CardTitle>
          </div>
          <div className="sm:ml-auto flex items-center gap-1">
            {car.trackingLink &&
              <Button size="sm" variant="outline" className="h-9 gap-1 text-sm font-semibold bg-gray-800/60 border-gray-600 text-white hover:bg-primary/20">
                <TruckIcon className="h-4 w-4" />
                <Link href={car.trackingLink}>
                  Track Car
                </Link>
              </Button>
            }
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 text-sm h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            {/* Tracking Info Card */}
            <section className="flex flex-col bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md border border-gray-700/60 rounded-xl p-6 shadow-lg flex-1 min-h-full">
              <h3 className="text-2xl font-bold tracking-wide flex items-center gap-2 text-white mb-2"><Calendar className="w-6 h-6 text-primary" />Tracking Info</h3>
              <div className="flex flex-col gap-y-8 mt-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    Purchase Date
                  </div>
                  <div className="text-lg font-bold text-white">{formatDateToInputValue(car.purchaseDate)}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Package className="w-5 h-5 flex-shrink-0" />
                    Estimated Departure Date
                  </div>
                  <div className="text-lg font-bold text-white">{car.departureDate ? formatDateToInputValue(car.departureDate) : "-"}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Package className="w-5 h-5 flex-shrink-0" />
                    Estimated Arrival Date
                  </div>
                  <div className="text-lg font-bold text-white">{car.arrivalDate ? formatDateToInputValue(car.arrivalDate) : "-"}</div>
                </div>
              </div>
            </section>
            {/* Shipping Info Card */}
            <section className="flex flex-col bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md border border-gray-700/60 rounded-xl p-6 shadow-lg flex-1 min-h-full">
              <h3 className="text-2xl font-bold tracking-wide flex items-center gap-2 text-white mb-2"><TruckIcon className="w-6 h-6 text-primary" />Shipping Info</h3>
              <div className="flex flex-col gap-y-8 mt-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Car className="w-5 h-5 flex-shrink-0" />
                    Body Type
                  </div>
                  <div className="text-lg font-bold text-primary uppercase">{car.bodyType ? car.bodyType : "-"}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Fuel className="w-5 h-5 flex-shrink-0" />
                    Fuel Type
                  </div>
                  <div className="text-lg font-bold text-primary uppercase">{car.fuelType ? car.fuelType : "-"}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <BadgeDollarSign className="w-5 h-5 flex-shrink-0" />
                    Booking #
                  </div>
                  <div className="text-lg font-bold"><Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-xs border-0">{car.bookingNumber ? car.bookingNumber : "-"}</Badge></div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <ContainerIcon className="w-5 h-5 flex-shrink-0" />
                    Container #
                  </div>
                  <div className="text-lg font-bold"><Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-xs border-0">{car.containerNumber ? car.containerNumber : "-"}</Badge></div>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}