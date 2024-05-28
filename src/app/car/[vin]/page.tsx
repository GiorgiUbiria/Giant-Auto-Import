import { getCarByVinFromAPI, getCarFromDatabase } from "@/app/actions";
import CarInfo from "@/components/car-info";
import { FeaturedImageGallery } from "@/components/image-gallery";

export default async function Page({ params }: { params: { vin: string } }) {
  const car = await getCarFromDatabase(params.vin);
  const data = await getCarByVinFromAPI(params.vin);

  const images = data.assets
    .filter((asset: any) => asset.type === "Image")
    .map((asset: any) => ({
      imgelink: asset.value,
    }));

  return (
    <div className="flex flex-row py-12 px-8">
      <div className="basis-1/2 flex justify-center">
        <FeaturedImageGallery data={images} />
      </div>
      <div className="basis-1/4">
        <CarInfo carData={car} />
      </div>
      <div className="bg-purple-500 basis-1/4"></div>
    </div>
  );
}
