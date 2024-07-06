import { getCarFromDatabase } from "@/lib/actions/dbActions";
import { CarData } from "@/lib/interfaces";

import CarInfo from "@/components/car-info";
import Gallery from "./featured-images";
import { getImagesFromBucket } from "@/lib/actions/bucketActions";
import StatusLine from "./status-line";

export default async function Page({ params }: { params: { vin: string } }) {
  const car: CarData | undefined = await getCarFromDatabase(params.vin);

  if (!car) {
    return <div>Car not found</div>;
  }

  const bucketImages = await getImagesFromBucket(params.vin);

  car.images = [...car.images!, ...bucketImages];

  return (
    <div className="flex flex-col">
      <div className="w-1/2 mx-auto">
        <StatusLine status={car?.parking_details?.status!} />
      </div>
      <div className="mt-8 w-11/12 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Gallery car={car} />
        <CarInfo carData={car} />
      </div>
    </div>
  );
}
