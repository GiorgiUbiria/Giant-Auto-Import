"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { handleUploadImagesAction } from "@/lib/actions/bucketActions"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
const MAX_IMAGE_SIZE = 4;

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
	const result = sizeInBytes / (1024 * 1024);
	return +result.toFixed(decimalsNum);
};

const ImageSchema = z.object({
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
});

const processImages = async (
	images: FileList | undefined,
	type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP",
): Promise<Array<{ buffer: number[]; size: number; name: string; type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP"; }>> => {
	if (!images || images.length === 0) return [];

	const fileData = await Promise.all(
		Array.from(images).map(async (file: File) => {
			const arrayBuffer = await file.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);
			return {
				buffer: Array.from(uint8Array),
				size: file.size,
				type: type,
				name: file.name,
			};
		}),
	);

	return fileData;
};

export function ImagesForm({ vin } : { vin: string }) {
	const form = useForm<z.infer<typeof ImageSchema>>({
		resolver: zodResolver(ImageSchema),
		defaultValues: {
		},
	})

	const { execute, isPending } = useServerAction(handleUploadImagesAction, {
		onError: (err) => { console.error(err.err.data) },
		onSuccess: () => {
			toast.success("Images Uploaded successfully");
		},
	});

	const onSubmit = async (values: z.infer<typeof ImageSchema>) => {
		try {
			const { warehouse_images, pick_up_images, auction_images, delivery_images } = values;

			const imagePromises = [
				processImages(warehouse_images, "WAREHOUSE"),
				processImages(auction_images, "AUCTION"),
				processImages(pick_up_images, "PICK_UP"),
				processImages(delivery_images, "DELIVERED"),
			];

			const imageResults = await Promise.all(imagePromises);

			const imagesData = imageResults.flat().filter(Boolean);

			const inputData = {
				vin: vin,
				...(imagesData.length > 0 ? { images: imagesData } : { images: [] }),
			};

			await execute(inputData);
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while submitting the form");
		}
	};

	const handleSubmit = form.handleSubmit(onSubmit)

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit} className="w-full space-y-6 my-12 md:my-4 bg-gray-200/90 dark:bg-gray-700 p-3 rounded-md">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
					<FormField
						control={form.control}
						name="auction_images"
						render={({ field: { value, onChange, ...fieldProps } }) => (
							<FormItem>
								<FormLabel>Auction Images</FormLabel>
								<FormControl>
									<Input type="file"
										{...fieldProps}
										multiple
										accept={ACCEPTED_IMAGE_TYPES.join(", ")}
										onChange={(event) =>
											onChange(event.target.files)
										}
									/>
								</FormControl>
								<FormDescription>
									Auction Images
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="warehouse_images"
						render={({ field: { value, onChange, ...fieldProps } }) => (
							<FormItem>
								<FormLabel>Warehouse Images</FormLabel>
								<FormControl>
									<Input type="file"
										{...fieldProps}
										multiple
										accept={ACCEPTED_IMAGE_TYPES.join(", ")}
										onChange={(event) =>
											onChange(event.target.files)
										}
									/>
								</FormControl>
								<FormDescription>
									Warehouse Images
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="delivery_images"
						render={({ field: { value, onChange, ...fieldProps } }) => (
							<FormItem>
								<FormLabel>Delivery Images</FormLabel>
								<FormControl>
									<Input type="file"
										{...fieldProps}
										multiple
										accept={ACCEPTED_IMAGE_TYPES.join(", ")}
										onChange={(event) =>
											onChange(event.target.files)
										}
									/>
								</FormControl>
								<FormDescription>
									Delivery Images
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="pick_up_images"
						render={({ field: { value, onChange, ...fieldProps } }) => (
							<FormItem>
								<FormLabel>Pick Up Images</FormLabel>
								<FormControl>
									<Input type="file"
										{...fieldProps}
										multiple
										accept={ACCEPTED_IMAGE_TYPES.join(", ")}
										onChange={(event) =>
											onChange(event.target.files)
										}
									/>
								</FormControl>
								<FormDescription>
									Pick Up Images
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<Button
					type="submit"
					className="w-full"
					disabled={isPending}
				>
					{
						isPending ? (
							<Loader2 className="animate-spin" />
						) : "Upload Images"
					}
				</Button>
			</form>
		</Form>
	)
}
