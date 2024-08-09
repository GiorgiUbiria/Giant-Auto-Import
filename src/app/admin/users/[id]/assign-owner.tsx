"use client";

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useServerAction } from "zsa-react"
import { getCarsAction } from "@/lib/actions/carActions";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox"

export const AssignOwner = ({ userId }: { userId: string }) => {
	const { isPending, execute, data } = useServerAction(getCarsAction);

	useEffect(() => {
		execute();
	}, [execute]);

	return (
		<AlertDialog>
			<AlertDialogTrigger>Open</AlertDialogTrigger>
			<AlertDialogContent className="text-primary">
				<AlertDialogHeader>
					<AlertDialogTitle>Choose cars to assign</AlertDialogTitle>
				</AlertDialogHeader>
				<ScrollArea className="w-full rounded-md border">
					<div className="p-4">
						<h4 className="mb-4 text-sm font-medium leading-none"> Cars </h4>
						{isPending && <Loader2 className="animate-spin" />}
						{data && data.map((car) => (
							<div key={car.id}>
								<div className="flex gap-x-2 text-sm">
									<p>{car.vin}</p>
									<p>{car.year + " " + car.make + " " + car.model}</p>
									<p>{car.totalFee}</p>
									<Checkbox className="justify-self-auto" />
								</div>
								<Separator className="my-2" />
							</div>
						))}
					</div>
				</ScrollArea>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
