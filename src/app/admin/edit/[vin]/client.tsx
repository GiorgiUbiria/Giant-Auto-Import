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
		<div className="container mx-auto px-4 py-8">
			<h2 className="text-4xl font-bold mb-4 text-primary">
				Edit Car with VIN -
				<Link href={`/car/${vin}`}>{vin}</Link>
			</h2>
			{
				isLoading ? <LoadingState /> : (
					<Tabs defaultValue="form" searchParam="type">
						<TabsList className="grid w-full grid-cols-1 lg:grid-cols-2">
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
