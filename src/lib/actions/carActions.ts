"use server";

import { desc, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../drizzle/db";
import { cars, insertCarSchema, selectCarSchema } from "../drizzle/schema";
import { createServerActionProcedure } from "zsa";
import { getAuth } from "../auth";
import { z } from "zod";

const AddCarFormSchema = insertCarSchema.omit({ id: true, ownerId: true, createdAt: true, totalFee: true, shippingFee: true, destinationPort: true, });
const SelectSchema = selectCarSchema.omit({ bodyType: true, destinationPort: true, createdAt: true,  });

const authedProcedure = createServerActionProcedure()
	.handler(async () => {
		try {
			const { user, session } = await getAuth();

			return {
				user,
				session,
			};
		} catch {
			throw new Error("User not authenticated")
		}
	});

const isAdminProcedure = createServerActionProcedure(authedProcedure)
	.handler(async ({ ctx }) => {
		const { user, session } = ctx;

		if (user?.role !== "ADMIN") {
			throw new Error("User is not an admin")
		}

		return {
			user,
			session,
		}
	});

export const addCarAction = isAdminProcedure
	.createServerAction()
	.input(AddCarFormSchema)
	.output(z.object({
		message: z.string().optional(),
		data: z.any().optional(),
		success: z.boolean(),
	}))
	.handler(async ({ input }) => {
		console.log("input", input);
		try {
			const [vin] = await db
				.insert(cars)
				.values(input)
				.returning({ vin: cars.vin })

			if (!vin || vin === null) {
				throw new Error("Could not add a car")
			}

			return {
				success: true,
				data: vin,
				message: `Car with vin code ${vin} was added successfully`,
			}
		} catch (error) {
			console.error(error);

			const errorMessage = error instanceof Error ? error.message : String(error);

			return {
				success: false,
				message: errorMessage,
			};
		}
	});

export const getCarsAction = isAdminProcedure
  .createServerAction()
  .output(z.array(SelectSchema))
  .handler(async () => {
    try {
      const carsQuery = await db
        .select({
          id: cars.id,
          vin: cars.vin,
					year: cars.year,
					model: cars.model,
					make: cars.make,
					auction: cars.auction,
					shippingFee: cars.shippingFee,
					purchaseFee: cars.purchaseFee,
					totalFee: cars.totalFee,
					fuelType: cars.fuelType,
					holder: cars.holder,
					ownerId: cars.ownerId,
					keys: cars.keys,
					title: cars.title,
					departureDate: cars.departureDate,
					arrivalDate: cars.arrivalDate,
					purchaseDate: cars.purchaseDate,
					bookingNumber: cars.bookingNumber,
					lotNumber: cars.lotNumber,
					containerNumber: cars.containerNumber,
					trackingLink: cars.trackingLink,
					originPort: cars.originPort,
					shippingStatus: cars.shippingStatus,
        })
        .from(cars)
        .orderBy(desc(cars.purchaseDate));

      return carsQuery;
    } catch (error) {
      console.error(error);
      return [];
    }
  });

