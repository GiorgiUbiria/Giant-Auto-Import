"use client";

import { getUserAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";

export const Owner = ({ id } : { id: string }) => {
	const { isLoading, data } = useServerActionQuery(getUserAction, {
		input: {
			id: id,
		},
		queryKey: ["getUser", id],
	})

	const LoadingState = () => {
		return (
			<div className="w-full h-full grid place-items-center">
				<Loader2 className="animate-spin text-center" />
			</div>
		)
	}

	return (
		<div className="py-10 text-primary">
			{isLoading ? <LoadingState /> : (
				<p> { data?.user.fullName }</p>
			)}
		</div>
	)
}
