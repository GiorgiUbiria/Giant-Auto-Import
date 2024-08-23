"use client";

import { Input } from "@/components/ui/input";
import { assignRecieverAction } from "@/lib/actions/carActions";
import { useServerActionMutation } from "@/lib/hooks/server-action-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Reciever = ({ reciever, vin }: { reciever: string | null, vin: string }) => {
	const queryClient = useQueryClient();

	const { isPending, mutate } = useServerActionMutation(assignRecieverAction, {
		onError: (error) => {
			const errorMessage = error?.data || "Failed to assign reciever";
			toast.error(errorMessage);
		},
		onSuccess: async ({ data }) => {
			const successMessage = data?.message || "Reciever assigned successfully!";
			toast.success(successMessage);

			await queryClient.invalidateQueries({
				queryKey: ["getCars"],
				refetchType: "active",
			});
		},
	});

	const LoadingState = () => {
		return (
			<div className="w-full h-full grid place-items-center">
				<Loader2 className="animate-spin text-center" />
			</div>
		);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			const newReciever = (e.target as HTMLInputElement).value;
			if (newReciever) {
				mutate({ reciever: newReciever, vin: vin });
			}
		}
	};

	return (
		<div className="py-10 text-primary">
			{isPending ? (
				<LoadingState />
			) : (
				reciever === null || reciever === undefined ? (
					<Input
						type="text"
						placeholder="Set reciever"
						onKeyDown={handleKeyPress}
					/>
				) : (
					<p>{reciever}</p>
				)
			)}
		</div>
	);
};
