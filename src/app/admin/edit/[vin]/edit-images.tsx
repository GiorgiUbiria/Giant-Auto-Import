"use client";

import { getImagesAction } from "@/lib/actions/imageActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { ImagesForm } from "./images-form";

export const EditImages = ({ vin }: { vin: string }) => {
	const { isLoading, data } = useServerActionQuery(getImagesAction, {
		input: {
			vin: vin,
		},
		queryKey: ["getImagesForCar", vin],
	})

	const LoadingState = () => {
		return (
			<div className="w-full h-full grid place-items-center">
				<Loader2 className="animate-spin text-center" />
			</div>
		)
	}

	return (
		<div className="flex flex-col">
			<ImagesForm vin={vin} />
			<div className="w-full grid grid-cols-1 lg:grid-cols-4">
				{
					isLoading ? <LoadingState /> : (
						data?.map((image) => (
							<Image
								style={{ transform: "translate3d(0, 0, 0)" }}
								key={image.imageKey}
								src={image.url}
								alt="Image"
								height="300"
								width="300"
							/>
						))
					)
				}
			</div>
		</div>
	)
}