"use client";

import { getUserAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import { UpdateAdminForm } from "./update-admin-form";

export const Client = ({ id }: { id: string }) => {
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
		<div>
			{isLoading ? <LoadingState /> : (
				<div className="w-full grid place-items-center">
					<h1 className="text-3xl my-8 flex gap-2 items-center"> Profile of - {data?.user.fullName} </h1>
					<UpdateAdminForm user={data?.user!} />
				</div>
			)}
		</div>
	)
}
