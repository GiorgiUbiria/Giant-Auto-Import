"use client";

import { getImageAction } from "@/lib/actions/imageActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export const TableImage = ({ vin }: { vin: string }) => {
	const { isLoading, data } = useServerActionQuery(getImageAction, {
		input: {
			vin: vin,
		},
		queryKey: ["getImage", vin],
	})

	if (!data) {
		return (
			<div className="w-[154px] flex justify-center ml-8">
				<div className="bg-gray-300 rounded-md size-16 w-full"></div>
			</div>
		);
	}

	const LoadingState = () => {
		return (
			<div className="w-full h-full grid place-items-center">
				<Loader2 className="animate-spin text-center" />
			</div>
		)
	}

	return (
		<div className="w-[154px] grid place-items-center ml-8">
			{isLoading ? <LoadingState /> : (
				<Image
					alt="Car Image"
					className="w-full h-[92px] aspect-square rounded-md object-cover"
					height="300"
					src={data.url}
					width="300"
				/>
			)}
		</div>
	)
}
