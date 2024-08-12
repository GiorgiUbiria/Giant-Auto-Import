"use client";

import { DataTable } from "@/components/data-table";
import { getUserAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { UpdateProfileForm } from "./edit-profile-form";

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
				<>
					<h1 className="text-3xl my-8"> Profile of - {data?.user.fullName} </h1>
					<UpdateProfileForm user={data?.user!} />
					<DataTable columns={columns} data={data?.cars!} />
				</>
			)}
		</div>
	)
}
