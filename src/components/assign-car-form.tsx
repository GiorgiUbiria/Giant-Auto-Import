import { db } from "@/lib/db";
import { assignCarToUser } from "@/lib/actions/dbActions";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default async function AssignCarForm({ userId }: { userId: string }) {
  const bindedAction = assignCarToUser.bind(null, userId);
  const cars = await getCarVins();

  return (
    <form action={bindedAction}>
      <Select name="car_vin">
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a vin code" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Car Vin Codes</SelectLabel>
            {cars.map((car) => (
              <SelectItem key={car.vin} value={car.vin}>
                {car.vin}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button type="submit"> Assign Car </Button>
    </form>
  );
}

interface CarVin {
  vin: string;
}

async function getCarVins(): Promise<CarVin[]> {
  "use server";
  try {
    const cars: CarVin[] = db
      .prepare(
        `
        SELECT 
          vin 
        FROM 
          car
        `,
      )
      .all() as CarVin[];

    if (cars.length === 0) {
      throw new Error("No cars found");
    }

    return cars;
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
}
