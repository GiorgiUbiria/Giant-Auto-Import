"use client";

import {
    AlertDialog,
    AlertDialogCancel,
		AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteUserAction } from "@/lib/actions/userActions";
import { useServerActionMutation } from "@/lib/hooks/server-action-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Props = {
	userId: string;
};

export function Actions({ userId }: Props) {
	const queryClient = useQueryClient();

	const { isPending, mutate } = useServerActionMutation(deleteUserAction, {
		onError: (error) => {
			const errorMessage = error?.data || "Failed to delete the user";
			toast.error(errorMessage);
		},
		onSuccess: async ({ data }) => {
			const successMessage = data?.message || "User deleted successfully!";
			toast.success(successMessage);

			await queryClient.invalidateQueries({
				queryKey: ["getUsers"],
				refetchType: "active",
			});
		},
	});

	const handleDelete = () => {
		mutate({ id: userId });
	};

	return (
		<div className="flex justify-center items-center gap-x-2">
			<Link href={`/admin/users/${userId}`} className="hover:text-blue-500 hover:underline">
				<Pencil className="size-4 hover:opacity-50 transition" />
			</Link>
			
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="link" size="icon">
						<Trash className="size-4 hover:opacity-50 hover:text-red-500 transition" />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent className="text-primary">
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure you want to delete the user with ID {userId}?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the user from the database.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button variant="destructive" onClick={handleDelete}>
								{isPending ? (
									<Loader2 className="size-2 animate-spin transition" />
								) : (
									"Delete"
								)}
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
