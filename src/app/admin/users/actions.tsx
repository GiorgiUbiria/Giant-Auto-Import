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
import { useTranslations } from "next-intl";

type Props = {
	userId: string;
	translations: {
		edit: string;
		delete: string;
		deleteConfirmDescription: string;
		cancel: string;
		deleteAction: string;
		deleting: string;
		deleteSuccess: string;
		deleteError: string;
	};
};

export function Actions({ userId, translations }: Props) {
	const queryClient = useQueryClient();
	const t = useTranslations("AdminUsers.actions");

	const { isPending, mutate } = useServerActionMutation(deleteUserAction, {
		onError: (error: unknown) => {
			const errorMessage = (error as any)?.data || translations.deleteError;
			toast.error(errorMessage);
		},
		onSuccess: async (response: { success: boolean; message?: string; data?: any }) => {
			const successMessage = response.message || translations.deleteSuccess;
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
			<Link
				href={`/admin/users/profile/${encodeURIComponent(userId)}`}
				className="hover:text-blue-500 hover:underline"
				title={translations.edit}
				prefetch={false}
			>
				<Pencil className="size-4 hover:opacity-50 transition" />
			</Link>

			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="link" size="icon" title={translations.delete}>
						<Trash className="size-4 hover:opacity-50 hover:text-red-500 transition" />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent className="text-primary">
					<AlertDialogHeader>
						<AlertDialogTitle className="leading-relaxed">
							{t("deleteConfirmTitle", { userId })}
						</AlertDialogTitle>
						<AlertDialogDescription className="leading-relaxed">
							{translations.deleteConfirmDescription}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{translations.cancel}</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button variant="destructive" onClick={handleDelete}>
								{isPending ? (
									<Loader2 className="size-2 animate-spin transition" />
								) : (
									translations.deleteAction
								)}
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
