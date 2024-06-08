import { getCarFromDatabase } from "@/lib/actions/dbActions";
import { CarData } from "@/lib/interfaces";

import CarInfo from "@/components/car-info";
import Gallery from "./featured-images";

export default async function Page({ params }: { params: { vin: string } }) {
  const car: CarData | undefined = await getCarFromDatabase(params.vin);

  if (!car) {
    return <div>Car not found</div>;
  }

  return (
    <div className="flex flex-col items-center w-full py-12">
      <div className="w-full flex flex-col gap-6 lg:flex-row py-12 px-8">
        <Gallery car={car} />
        <div className="lg:basis-1/2 lg:flex lg:justify-center">
          <CarInfo carData={car} />
        </div>
      </div>
    </div>
  );
}
