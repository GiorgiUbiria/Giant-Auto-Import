"use client";

import { EditCarForm } from "@/components/edit-car-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabLinks";
import { getCarAction } from "@/lib/actions/carActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { EditImages } from "./edit-images";

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
		<div className="w-full grid place-items-center mt-8">
			<h1 className="text-3xl text-primary my-4 text-center">
				Edit Car with VIN - {" "} <Link href={`/car/${vin}`}>{vin}</Link> 
			</h1>
			{
				isLoading ? <LoadingState /> : (
					<Tabs defaultValue="form" searchParam="type" className="w-full md:w-1/2 lg:w-1/3">
						<TabsList className="grid w-full grid-cols-1 lg:grid-cols-2 gap-2">
							<TabsTrigger value="form">Form</TabsTrigger>
							<TabsTrigger value="images">Images</TabsTrigger>
						</TabsList>
						<TabsContent value="form">
							<EditCarForm car={data!} />
						</TabsContent>
						<TabsContent value="images">
							<EditImages vin={vin} />
						</TabsContent>
					</Tabs>
				)
			}
		</div>
	)
}
