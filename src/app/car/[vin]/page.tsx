import { getCarFromDatabase } from "@/app/actions";
import CarInfo from "@/components/car-info";
import { FeaturedImageGallery } from "@/components/image-gallery";
import StatusLine from "@/components/status-line";
import { DbCar, GalleryImage } from "@/lib/interfaces";

export default async function Page({ params }: { params: { vin: string } }) {
  const car: DbCar | undefined = await getCarFromDatabase(params.vin);

  if (!car) {
    return <div>Car not found</div>;
  }

  const images: GalleryImage[] = car.images.map((base64Image: string) => ({
    imgelink: `data:image/jpeg;base64,${base64Image}`,
  }));

  return (
    <div className="flex flex-col items-center w-full py-12">
      <div className="w-[800px]">
        <StatusLine />
      </div>
      <div className="w-full flex flex-row py-12 px-8">
        <div className="basis-1/2 flex justify-center">
          <FeaturedImageGallery data={images} />
        </div>
        <div className="basis-1/2 flex justify-center">
          <CarInfo carData={car!} />
        </div>
      </div>
    </div>
  );
}
