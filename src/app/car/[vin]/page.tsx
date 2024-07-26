import dynamic from 'next/dynamic';

import { getCarFromDatabase } from "@/lib/actions/dbActions";
import { CarData } from "@/lib/interfaces";

const CarInfo = dynamic(() => import('@/components/car-info'));
const Gallery = dynamic(() => import('./featured-images'));
const StatusLine = dynamic(() => import('./status-line'));

export default async function Page({ params }: { params: { vin: string } }) {
  const car: CarData | undefined = await getCarFromDatabase(params.vin);
  if (!car) {
    return <div>Car not found</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="w-1/2 mx-auto">
        <StatusLine status={car?.parking_details?.status!} />
      </div>
      <div className="mt-8 w-11/12 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Gallery images={car.images!} vin={car.car.vin!} />
        <CarInfo carData={car} />
      </div>
    </div>
  );
}
