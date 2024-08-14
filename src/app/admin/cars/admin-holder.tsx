"use client";

import { Input } from "@/components/ui/input";
import { assignHolderAction } from "@/lib/actions/carActions";
import { useServerActionMutation } from "@/lib/hooks/server-action-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const AdminHolder = ({ holder, vin }: { holder: string | null, vin: string }) => {
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [newHolder, setNewHolder] = useState(holder || "");

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

			setIsEditing(false);
		},
	});

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && newHolder.trim()) {
			mutate({ holder: newHolder, vin });
		}
	};

	const handleBlur = () => {
		if (newHolder.trim()) {
			mutate({ holder: newHolder, vin });
		} else {
			setIsEditing(false);
		}
	};

	return (
		<div className="py-10 text-primary">
			{isPending ? (
				<div className="w-full h-full grid place-items-center">
					<Loader2 className="animate-spin text-center" />
				</div>
			) : (
				isEditing ? (
					<Input
						type="text"
						value={newHolder}
						onChange={(e) => setNewHolder(e.target.value)}
						onKeyDown={handleKeyPress}
						onBlur={handleBlur}
						autoFocus
					/>
				) : (
					<p
						onClick={() => setIsEditing(true)}
						className="cursor-pointer hover:underline"
					>
						{holder || "No holder assigned"}
					</p>
				)
			)}
		</div>
	);
};
