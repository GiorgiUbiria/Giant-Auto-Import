"use client";

import { getCarAction } from "@/lib/actions/carActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import CarInfo from "./car-info";
import { ImageGallery } from "./image-gallery";
import StatusLine from "./status-line";

export const Client = ({ vin }: { vin: string }) => {
	const { isLoading, data } = useServerActionQuery(getCarAction, {
		input: {
			vin: vin,
		},
		queryKey: ["getCar", vin],
	})

	const LoadingState = () => {
		return (
			<div className="w-full h-full grid place-items-center">
				<Loader2 className="animate-spin text-center" />
			</div>
		)
	}

	return (
		<div className="flex flex-col mb-4 mt-8 md:mt-4 px-4 sm:px-6 lg:px-8">
			{
				isLoading ? <LoadingState /> : (
					<div>
						<div className="w-full lg:w-3/4 mx-auto mb-8">
							<StatusLine status={data?.shippingStatus!} />
						</div>
						<div className="mt-8 w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
							<ImageGallery vin={data?.vin!} />
							<CarInfo car={data!} />
						</div>
					</div>
				)
			}
		</div>
	)
}