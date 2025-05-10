"use client";

import { DataTable } from "@/components/data-table";
import { getUserAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2, Pencil } from "lucide-react";
import { columns } from "./columns";
import { UpdateProfileForm } from "./edit-profile-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Suspense } from "react";

const LoadingState = () => {
	return (
		<div className="w-full h-40 grid place-items-center">
			<Loader2 className="animate-spin text-primary" size={32} />
		</div>
	)
}

const ErrorState = ({ message }: { message?: string }) => {
	return (
		<Alert variant="destructive" className="my-4">
			<AlertDescription>
				{message || "Failed to load user data. Please try refreshing the page."}
			</AlertDescription>
		</Alert>
	)
}

export const Client = ({ id }: { id: string }) => {
	const { isLoading, data, error } = useServerActionQuery(getUserAction, {
		input: {
			id: id,
		},
		queryKey: ["getUser", id],
	})

	if (isLoading) {
		return <LoadingState />;
	}

	if (error || !data?.success || !data?.user) {
		return <ErrorState message={data?.message} />;
	}

	return (
		<div>
			<h1 className="text-3xl my-8 flex gap-2 items-center">
				Profile of - {data.user.fullName}
				<Suspense fallback={<LoadingState />}>
					<Dialog>
						<DialogTrigger>
							<span className="cursor-pointer">
								<Pencil className="size-6 hover:opacity-50 transition" />
							</span>
						</DialogTrigger>
						<DialogContent className="text-primary">
							<DialogHeader>
								<DialogTitle>Update Profile</DialogTitle>
							</DialogHeader>
							<UpdateProfileForm user={data.user} />
						</DialogContent>
					</Dialog>
				</Suspense>
			</h1>
			<DataTable 
				columns={columns} 
				data={data.cars ?? []} 
				filterKey="vin" 
			/>
		</div>
	)
}
