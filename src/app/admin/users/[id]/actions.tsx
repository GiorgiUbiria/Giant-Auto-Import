"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteCarAction } from "@/lib/actions/carActions";
import { Loader2, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

type Props = {
	vin: string;
}

export function Actions({ vin }: Props) {
	const router = useRouter();
	const { isPending, execute } = useServerAction(deleteCarAction);

	return (
		<div className="flex justify-center items-center gap-x-2">
			<Link href={`/admin/edit/${vin}`} className="hover:text-blue-500 hover:underline">
				<Pencil className="size-4 hover:opacity-50 transition" />
			</Link>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						variant="link"
						size="icon"
					>
						<Trash className="size-4 hover:opacity-50 hover:text-red-500 transition" />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent className="text-primary">
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure you want to delete the car with vin code {vin}?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the car from the database
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<Button
							variant="destructive"
							onClick={async () => {
								const [data, err] = await execute({
									vin: vin,
								})

								if (data?.success === false) {
									toast.error(data?.message)
								} else {
									toast.success(data?.message)
									router.refresh();
								}
							}}
						>
							{isPending ? (
								<Loader2 className="size-2 animate-spin transition" />
							) : (
								"Delete"
							)}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
