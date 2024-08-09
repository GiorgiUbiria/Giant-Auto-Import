"use server";

import { desc, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "../drizzle/db";
import { cars, insertCarSchema, selectCarSchema } from "../drizzle/schema";
import { createServerActionProcedure } from "zsa";
import { getAuth } from "../auth";
import { z } from "zod";

const AddCarFormSchema = insertCarSchema.omit({ id: true, ownerId: true, createdAt: true, totalFee: true, shippingFee: true, destinationPort: true, });
const SelectSchema = selectCarSchema.omit({ destinationPort: true, createdAt: true, });

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
		try {
			const [vin] = await db
				.insert(cars)
				.values(input)
				.returning({ vin: cars.vin });

			if (!vin || vin === null) {
				throw new Error("Could not add a car")
			};

			revalidatePath("/admin/cars");

			return {
				success: true,
				message: `Car with vin code ${vin} was added successfully`,
			};
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
					bodyType: cars.bodyType,
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

			return carsQuery.length ? carsQuery : [];
		} catch (error) {
			console.error("Error fetching cars:", error);
			throw new Error("Failed to fetch cars");
		}
	});

export const getCarAction = isAdminProcedure
	.createServerAction()
	.input(z.object({
		vin: z.string().optional(),
		id: z.number().optional(),
	}))
	.output(z.union([SelectSchema, z.null()]))
	.handler(async ({ input }) => {
		const { vin, id } = input;

		if (!id && !vin) {
			return null;
		}

		try {
			const whereClause = [];
			if (id !== undefined) {
				whereClause.push(eq(cars.id, id));
			}
			if (vin !== undefined) {
				whereClause.push(eq(cars.vin, vin));
			}

			const [carQuery] = await db
				.select({
					id: cars.id,
					vin: cars.vin,
					year: cars.year,
					model: cars.model,
					make: cars.make,
					auction: cars.auction,
					shippingFee: cars.shippingFee,
					purchaseFee: cars.purchaseFee,
					bodyType: cars.bodyType,
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
				.where(or(...whereClause));

			return carQuery ?? null;
		} catch (error) {
			console.error("Error fetching car:", error);
			throw new Error("Failed to fetch car");
		}
	});

export const deleteCarAction = isAdminProcedure
	.createServerAction()
	.input(z.object({
		vin: z.string().optional(),
		id: z.number().optional(),
	}))
	.output(z.object({
		message: z.string().optional(),
		data: z.any().optional(),
		success: z.boolean(),
	}))
	.handler(async ({ input }) => {
		const { vin, id } = input;

		if (!id && !vin) {
			return {
				success: false,
				message: "Provide car's vin code or id",
			};
		}

		try {
			const whereClause = [];
			if (id !== undefined) {
				whereClause.push(eq(cars.id, id));
			}
			if (vin !== undefined) {
				whereClause.push(eq(cars.vin, vin));
			}

			const carExists = await db
				.select()
				.from(cars)
				.where(or(...whereClause))
				.limit(1);

			if (!carExists.length) {
				return {
					success: false,
					message: "Car does not exist",
				};
			}

			const [isDeleted] = await db
				.delete(cars)
				.where(or(...whereClause))
				.returning({ vin: cars.vin });

			if (!isDeleted) {
				return {
					success: false,
					message: "Could not delete the car",
				};
			}

			revalidatePath("/admin/cars");

			return {
				success: true,
				message: `Car with vin code ${isDeleted.vin} was deleted successfully`,
			};
		} catch (error) {
			console.error("Error deleting car:", error);
			throw new Error("Failed to delete car");
		}
	});

export const assignOwnerAction = isAdminProcedure
	.createServerAction()
	.input(z.object({
		vin: z.string().optional(),
		carId: z.number().optional(),
		userId: z.string().nullable(),
	}))
	.output(z.object({
		message: z.string().optional(),
		data: z.any().optional(),
		success: z.boolean(),
	}))
	.handler(async ({ input }) => {
		const { vin, carId, userId } = input;

		if (!carId && !vin) {
			return {
				success: false,
				message: "Provide car's vin code or id, and user's id",
			};
		}

		try {
			const whereClause = [];
			if (carId !== undefined) {
				whereClause.push(eq(cars.id, carId));
			}
			if (vin !== undefined) {
				whereClause.push(eq(cars.vin, vin));
			}

			const carExists = await db
				.select()
				.from(cars)
				.where(or(...whereClause))
				.limit(1);

			if (!carExists.length) {
				return {
					success: false,
					message: "Car does not exist",
				};
			}

			const [isAssigned] = await db
				.update(cars)
				.set({
					ownerId: userId,
				})
				.where(or(...whereClause))
				.returning({ vin: cars.vin });

			if (!isAssigned) {
				return {
					success: false,
					message: "Could not assign the owner to car",
				};
			}

			revalidatePath(`/admin/users/${userId}`);

			return {
				success: true,
				message: userId ? `Car with vin code ${isAssigned.vin} was successfully assigned to the user with id ${userId}` : `Car's owner cleared`,
			};
		} catch (error) {
			console.error("Error assigning owner:", error);
			throw new Error("Failed to assign the owner to car");
		}
	});
