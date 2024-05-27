import { fetchCar, getCarByVinFromAPI } from "@/app/actions";
import ImageGallery from "@/components/image-grid";

export default async function Page({ params }: { params: { vin: string } }) {
  const car = await fetchCar(params.vin);
  const data = await getCarByVinFromAPI(params.vin);

  const images = data.assets.map((asset: any) => {
    return {
      src: asset.value,
      alt: "car",
    }
  })

  return (
    <div>
      <p> {JSON.stringify(car)}</p>
      <ImageGallery images={images} /> 
    </div>
  );
}
