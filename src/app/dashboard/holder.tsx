"use client";

import { Input } from "@/components/ui/input";
import { assignHolderAction } from "@/lib/actions/carActions";
import { useServerActionMutation } from "@/lib/hooks/server-action-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Holder = ({ holder, vin }: { holder: string | null, vin: string }) => {
	const queryClient = useQueryClient();

	const { isPending, mutate } = useServerActionMutation(assignHolderAction, {
		onError: (error) => {
			const errorMessage = error?.data || "Failed to assign holder";
			toast.error(errorMessage);
		},
		onSuccess: async ({ data }) => {
			const successMessage = data?.message || "Holder assigned successfully!";
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
			const newHolder = (e.target as HTMLInputElement).value;
			if (newHolder) {
				mutate({ holder: newHolder, vin: vin });
			}
		}
	};

	return (
		<div className="py-10 text-primary">
			{isPending ? (
				<LoadingState />
			) : (
				holder === null || holder === undefined ? (
					<Input
						type="text"
						placeholder="Set holder"
						onKeyDown={handleKeyPress}
					/>
				) : (
					<p>{holder}</p>
				)
			)}
		</div>
	);
};
