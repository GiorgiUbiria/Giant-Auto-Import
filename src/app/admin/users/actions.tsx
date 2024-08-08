"use client";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteUserAction } from "@/lib/actions/userActions";
import { Loader2, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";

type Props = {
	userId: string;
}

export function Actions({ userId }: Props) {
	const router = useRouter();
	const { isPending, execute } = useServerAction(deleteUserAction);

	return (
		<div className="flex justify-center items-center gap-x-2">
			<Link href={`/admin/users/${userId}`} className="hover:text-blue-500 hover:underline">
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
						<AlertDialogTitle>Are you sure you want to delete the user with id {userId}?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the user from the database
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<Button
							variant="destructive"
							onClick={async () => {
								const [data, err] = await execute({
									id: userId,
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
