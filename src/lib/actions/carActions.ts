"use server";

import { desc, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "../drizzle/db";
import { cars, images, insertCarSchema, insertImageSchema, selectCarSchema } from "../drizzle/schema";
import { createServerActionProcedure } from "zsa";
import { getAuth } from "../auth";
import { z } from "zod";
import { ListObjectsV2Command, PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"];
const MAX_IMAGE_SIZE = 4;
const endpoint = process.env.CLOUDFLARE_API_ENDPOINT as string;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID as string;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string;
const bucketName = process.env.CLOUDFLARE_BUCKET_NAME as string;

const S3Client = new S3({
	region: "auto",
	endpoint: endpoint,
	credentials: {
		accessKeyId: accessKeyId,
		secretAccessKey: secretAccessKey,
	},
});

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
	const result = sizeInBytes / (1024 * 1024);
	return +result.toFixed(decimalsNum);
};

const AddCarInitialFormSchema = insertCarSchema.omit({ id: true, createdAt: true, totalFee: true, shippingFee: true, destinationPort: true, });
const ImageSchema = {
	auction_images: z
		.custom<FileList>()
		.refine((files) => {
			return Array.from(files ?? []).every(
				(file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
			);
		}, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
		.refine((files) => {
			return Array.from(files ?? []).every((file) =>
				ACCEPTED_IMAGE_TYPES.includes(file.type),
			);
		}, "File type is not supported")
		.optional(),
	pick_up_images: z
		.custom<FileList>()
		.refine((files) => {
			return Array.from(files ?? []).every(
				(file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
			);
		}, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
		.refine((files) => {
			return Array.from(files ?? []).every((file) =>
				ACCEPTED_IMAGE_TYPES.includes(file.type),
			);
		}, "File type is not supported")
		.optional(),
	warehouse_images: z
		.custom<FileList>()
		.refine((files) => {
			return Array.from(files ?? []).every(
				(file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
			);
		}, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
		.refine((files) => {
			return Array.from(files ?? []).every((file) =>
				ACCEPTED_IMAGE_TYPES.includes(file.type),
			);
		}, "File type is not supported")
		.optional(),
	delivery_images: z
		.custom<FileList>()
		.refine((files) => {
			return Array.from(files ?? []).every(
				(file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
			);
		}, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
		.refine((files) => {
			return Array.from(files ?? []).every((file) =>
				ACCEPTED_IMAGE_TYPES.includes(file.type),
			);
		}, "File type is not supported")
		.optional(),
}
const AddCarFormSchema = AddCarInitialFormSchema.extend(ImageSchema);
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

async function getFileCount(prefix: string): Promise<number> {
	const command = new ListObjectsV2Command({
		Bucket: bucketName,
		Prefix: prefix,
	});

	let fileCount = 0;
	let truncated: boolean = true;

	while (truncated) {
		const response = await S3Client.send(command);
		fileCount += response.Contents?.length ?? 0;
		truncated = response.IsTruncated as boolean;
		if (truncated) {
			command.input.ContinuationToken = response.NextContinuationToken;
		}
	}

	return fileCount;
}

export async function handleUploadImages(
	type: "WAREHOUSE" | "PICK_UP" | "DELIVERED" | "AUCTION",
	vin: string,
	sizes: number[],
): Promise<string[]> {
	const prefix = `${vin}/${type}/`;
	const existingFileCount = await getFileCount(prefix);

	const keys = sizes.map((_size, index) => {
		const newIndex = existingFileCount + index + 1;
		return `${prefix}${newIndex}.png`;
	});

	const urls = await Promise.all(
		keys.map(async (key, index) => {
			const command = new PutObjectCommand({
				Bucket: bucketName,
				Key: key,
				ContentLength: sizes[index],
				ContentType: "image/png",
			});

			const signedUrl = await getSignedUrl(S3Client, command, {
				expiresIn: 3600,
			});

			const insertValues: z.infer<typeof insertImageSchema> = {
				carVin: vin,
				imageType: type as "AUCTION" | "DELIVERED" | "WAREHOUSE" | "PICK_UP",
				imageKey: key,
				priority: null,
			}

			await db.insert(images).values(insertValues);

			return signedUrl;
		}),
	);

	return urls;
}

// async function uploadImages(vin: string, imageFiles: Record<string, FileList | undefined>) {
// 	const imageTypes = {
// 		auction_images: "AUCTION",
// 		pick_up_images: "PICK_UP",
// 		warehouse_images: "WAREHOUSE",
// 		delivery_images: "DELIVERED",
// 	};
//
// 	for (const [category, fileList] of Object.entries(imageFiles)) {
// 		if (fileList) {
// 			const type = imageTypes[category as keyof typeof imageTypes];
// 			const prefix = `${vin}/${type}/`;
// 			const existingFileCount = await getFileCount(prefix);
//
// 			await Promise.all(Array.from(fileList).map(async (file, index) => {
// 				const newIndex = existingFileCount + index + 1;
// 				const key = `${prefix}${newIndex}.png`;
//
// 				await S3Client.putObject({
// 					Bucket: bucketName,
// 					Key: key,
// 					Body: file,
// 					ContentType: file.type,
// 				});
//
// 				const insertValues: z.infer<typeof insertImageSchema> = {
// 					carVin: vin,
// 					imageType: type as "AUCTION" | "DELIVERED" | "WAREHOUSE" | "PICK_UP",
// 					imageKey: key,
// 					priority: null,
// 				}
//
// 				await db.insert(images).values(insertValues);
// 			}));
// 		}
// 	}
// }

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
			const {
				warehouse_images,
				pick_up_images,
				auction_images,
				delivery_images,
				...carData
			} = input;

			const result = await db
				.insert(cars)
				.values(carData)
				.returning({ vin: cars.vin });

			const vin = result[0]?.vin;

			if (!vin) {
				throw new Error("Could not add a car");
			}

			revalidatePath("/admin/cars");

			return {
				success: true,
				message: `Car with VIN code ${vin} was added successfully`,
				data: { warehouse_images, pick_up_images, auction_images, delivery_images, vin }
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

export const getCarsAction = authedProcedure
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

export const getCarAction = authedProcedure
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
		vin: z.string(),
		carId: z.number(),
		ownerId: z.string().nullable(),
	}))
	.output(z.object({
		message: z.string().optional(),
		data: z.any().optional(),
		success: z.boolean(),
	}))
	.handler(async ({ input }) => {
		const { vin, carId, ownerId } = input;

		if (!carId || !vin) {
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
					ownerId: ownerId,
				})
				.where(or(...whereClause))
				.returning({ vin: cars.vin });

			if (!isAssigned) {
				return {
					success: false,
					message: "Could not assign the owner to car",
				};
			}

			revalidatePath(`/admin/users/${ownerId}`);

			return {
				success: true,
				message: ownerId !== "none" ? `Car with vin code ${isAssigned.vin} was successfully assigned to the user with id ${ownerId}` : `Car's owner cleared`,
			};
		} catch (error) {
			console.error("Error assigning owner:", error);
			throw new Error("Failed to assign the owner to car");
		}
	});

export const updateCarAction = isAdminProcedure
	.createServerAction()
	.input(insertCarSchema)
	.output(z.object({
		message: z.string().optional(),
		data: z.any().optional(),
		success: z.boolean(),
	}))
	.handler(async ({ input }) => {
		const car = input;

		car.ownerId = car.ownerId !== "none" ? car.ownerId : null;

		try {
			const updatedCar = await db
				.update(cars)
				.set(car)
				.where(eq(cars.vin, car.vin))
				.returning();

			if (!updatedCar) {
				return {
					success: false,
					message: "Car update failed",
				};
			}

			revalidatePath(`/admin/cars/edit/${car.vin}`);
			revalidatePath(`/admin/cars/`);

			return {
				success: true,
				message: `Car with vin ${car.vin} was updated successfully`,
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
