"use client";

import { DataTable } from "@/components/data-table";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { getUsersAction } from "@/lib/actions/userActions";

export const Client = () => {
	const { isLoading, data, error } = useServerActionQuery(getUsersAction, {
		input: undefined,
		queryKey: ["getUsers"],
	})

	const LoadingState = () => {
		return (
			<div className="w-full h-full grid place-items-center">
				<Loader2 className="animate-spin text-center" />
			</div>
		)
	}

	if (error) {
		return <div>Error loading users: {error.message}</div>
	}

	return (
    <div className="container mx-auto py-10 text-primary">
      <h1 className="text-3xl font-bold pb-8">Users</h1>
			{isLoading ? <LoadingState /> : (
				data && data.length > 0 ? (
					<DataTable columns={columns} data={data} filterKey="fullName" />
				) : (
					<div>No users found</div>
				)
			)}
    </div>
	)
}
