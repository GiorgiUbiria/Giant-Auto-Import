import { getImagesByVinFromAPI, getCarFromDatabase } from "@/app/actions";
import CarInfo from "@/components/car-info";
import { FeaturedImageGallery } from "@/components/image-gallery";
import StatusLine from "@/components/status-line";
import { APIAssets, GalleryImage } from "@/lib/interfaces";

export default async function Page({ params }: { params: { vin: string } }) {
  const car = await getCarFromDatabase(params.vin);
  const data = await getImagesByVinFromAPI(params.vin);

  const images: GalleryImage[] | undefined = data?.assets
    .filter((asset: APIAssets) => asset.type === "Image")
    .map((asset: APIAssets) => ({
      imgelink: asset.value,
    }));

  return (
    <div className="flex flex-col items-center w-full py-12">
      <div className="w-[800px]">
        <StatusLine />
      </div>
      <div className="w-full flex flex-row py-12 px-8">
        <div className="basis-1/2 flex justify-center">
          <FeaturedImageGallery data={images!} />
        </div>
        <div className="basis-1/2 flex justify-center">
          <CarInfo carData={car!} />
        </div>
      </div>
    </div>
  );
}
