"use client";

import { getCarPublicAction } from "@/lib/actions/carActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import CarInfo from "./car-info";
import { ImageGallery } from "./image-gallery";
import StatusLine from "./status-line";
import { Suspense } from "react";

const LoadingState = () => (
	<div className="w-full h-[50vh] grid place-items-center">
		<div className="flex flex-col items-center gap-2">
			<Loader2 className="h-8 w-8 animate-spin text-primary" />
			<p className="text-muted-foreground">Loading car details...</p>
		</div>
	</div>
);

const ErrorState = ({ vin }: { vin: string }) => (
	<div className="w-full h-[50vh] grid place-items-center">
		<div className="flex flex-col items-center gap-4 text-center">
			<div className="text-6xl">🚗</div>
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Car Not Found</h2>
			<p className="text-muted-foreground max-w-md">
				The car with VIN <span className="font-mono font-semibold">{vin}</span> could not be found or is not available.
			</p>
			<div className="flex gap-2 mt-4">
				<button 
					onClick={() => window.history.back()} 
					className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
				>
					Go Back
				</button>
			</div>
		</div>
	</div>
);

export const Client = ({ vin }: { vin: string }) => {
	const { isLoading, data, error } = useServerActionQuery(getCarPublicAction, {
		input: {
			vin: vin,
		},
		queryKey: ["getCar", vin],
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		retry: 1, // Only retry once
	});

	return (
		<div className="flex flex-col mb-4 mt-8 md:mt-4 px-4 sm:px-6 lg:px-8">
			<Suspense fallback={<LoadingState />}>
				{isLoading ? (
					<LoadingState />
				) : error || !data ? (
					<ErrorState vin={vin} />
				) : (
					<div>
						<div className="w-full lg:w-3/4 mx-auto mb-8">
							<StatusLine status={data.shippingStatus} />
						</div>
						<div className="mt-8 w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
							<ImageGallery vin={data.vin} />
							<CarInfo car={data} />
						</div>
					</div>
				)}
			</Suspense>
		</div>
	);
};