import { db } from "@/lib/drizzle/db";
import { cars } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import CarInfo from "./car-info";
import { FallbackImageGallery } from "./fallback-image-gallery";
import StatusLine from "./status-line";

const ErrorState = ({ vin }: { vin: string }) => (
  <div className="w-full h-[50vh] grid place-items-center">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="text-6xl">🚗</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Car Not Found</h2>
      <p className="text-muted-foreground max-w-md">
        The car with VIN <span className="font-mono font-semibold">{vin}</span> could not be found or is not available.
      </p>
    </div>
  </div>
);

export const ServerClient = async ({ vin }: { vin: string }) => {
  try {
    console.log("ServerClient: Fetching car data for VIN:", vin);

    const [carData] = await db
      .select()
      .from(cars)
      .where(eq(cars.vin, vin));

    console.log("ServerClient: Query completed", { found: !!carData, vin: carData?.vin });

    if (!carData) {
      return <ErrorState vin={vin} />;
    }

    return (
      <div className="flex flex-col mb-4 mt-8 md:mt-4 px-4 sm:px-6 lg:px-8">
        <div className="w-full lg:w-3/4 mx-auto mb-8">
          <StatusLine status={carData.shippingStatus} />
        </div>
        <div className="mt-8 w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <FallbackImageGallery vin={carData.vin} />
          <CarInfo car={carData} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("ServerClient: Error fetching car data", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      vin
    });
    
    return <ErrorState vin={vin} />;
  }
}; 