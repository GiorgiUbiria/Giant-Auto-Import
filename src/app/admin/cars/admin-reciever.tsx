"use client";

import { Input } from "@/components/ui/input";
import { assignRecieverAction } from "@/lib/actions/carActions";
import { useServerActionMutation } from "@/lib/hooks/server-action-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Adminreciever = ({ reciever, vin }: { reciever: string | null, vin: string }) => {
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [newReciever, setNewReciever] = useState(reciever || "");

	const { isPending, mutate } = useServerActionMutation(assignRecieverAction, {
		onError: (error) => {
			const errorMessage = error?.data || "Failed to assign reciever";
			toast.error(errorMessage);
		},
		onSuccess: async ({ data }) => {
			const successMessage = data?.message || "reciever assigned successfully!";
			toast.success(successMessage);

			await queryClient.invalidateQueries({
				queryKey: ["getCars"],
				refetchType: "active",
			});

			setIsEditing(false);
		},
	});

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && newReciever.trim()) {
			mutate({ reciever: newReciever, vin });
		}
	};

	const handleBlur = () => {
		if (newReciever.trim()) {
			mutate({ reciever: newReciever, vin });
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
						value={newReciever}
						onChange={(e) => setNewReciever(e.target.value)}
						onKeyDown={handleKeyPress}
						onBlur={handleBlur}
						autoFocus
					/>
				) : (
					<p
						onClick={() => setIsEditing(true)}
						className="cursor-pointer hover:underline"
					>
						{reciever || "No reciever assigned"}
					</p>
				)
			)}
		</div>
	);
};
