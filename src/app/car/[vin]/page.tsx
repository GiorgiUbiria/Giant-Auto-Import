import { getCarFromDatabase } from "@/lib/actions/dbActions";
import CarInfo from "@/components/car-info";
import { FeaturedImageGallery } from "@/components/image-gallery";
import StatusLine from "@/components/status-line";
import { DbCar, GalleryImage } from "@/lib/interfaces";
import sharp from "sharp";

export default async function Page({ params }: { params: { vin: string } }) {
  const car: DbCar | undefined = await getCarFromDatabase(params.vin);

  if (!car) {
    return <div>Car not found</div>;
  }

  const imagesPromise: Promise<GalleryImage>[] = car.images.map(
    async (base64Image: string) => {
      try {
        const buffer = Buffer.from(base64Image, "base64");

        const processedBuffer = await sharp(buffer)
          .resize({ width: 800 })
          .jpeg({ quality: 100 })
          .toBuffer();

        const processedBase64 = processedBuffer.toString("base64");

        return {
          imgelink: `data:image/jpeg;base64,${processedBase64}`,
        };
      } catch (error) {
        console.error("Error processing image:", error);
        return {
          imgelink: "placeholder.jpg",
        };
      }
    },
  );

  const images: GalleryImage[] = await Promise.all(imagesPromise);

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
