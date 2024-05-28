import { getCarByVinFromAPI, getCarFromDatabase } from "@/app/actions";
import CarInfo from "@/components/car-info";
import { FeaturedImageGallery } from "@/components/image-gallery";
import StatusLine from "@/components/status-line";

export default async function Page({ params }: { params: { vin: string } }) {
  const car = await getCarFromDatabase(params.vin);
  const data = await getCarByVinFromAPI(params.vin);

  const images = data.assets
    .filter((asset: any) => asset.type === "Image")
    .map((asset: any) => ({
      imgelink: asset.value,
    }));

  return (
    <div className="flex flex-row py-12 pl-12">
      <div className="basis-1/8 flex justify-center">
        <StatusLine />
      </div>
      <div className="basis-1/2 flex justify-center">
        <FeaturedImageGallery data={images} />
      </div>
      <div className="basis-1/2 flex justify-center">
        <CarInfo carData={car!} />
      </div>
    </div>
  );
}
