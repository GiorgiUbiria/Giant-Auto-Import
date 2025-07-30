import { getDb } from "@/lib/drizzle/db";
import { cars } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import CarClientView from "./CarClientView";

export const ServerClient = async ({ vin }: { vin: string }) => {
  try {
    const db = getDb();
    const [carData] = await db
      .select()
      .from(cars)
      .where(eq(cars.vin, vin));

    return <CarClientView carData={carData} />;
  } catch (error) {
    // fallback error UI
    return (
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
  }
}; 