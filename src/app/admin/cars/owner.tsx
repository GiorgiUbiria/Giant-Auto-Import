"use client";

import { getUserAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export const Owner = ({ id }: { id: string }) => {
	const { isLoading, data } = useServerActionQuery(getUserAction, {
		input: {
			id: id,
		},
		queryKey: ["getUser", id],
	})

	const LoadingState = () => {
		return (
			<Link href=""><Loader2 className="animate-spin text-center" /></Link>
		)
	}

	return (
		<div className="py-10 text-primary">
			{isLoading ? <LoadingState /> : (
				<Link href={data?.user.id!} className="font-semibold hover:underline"> {data?.user.fullName} </Link>
			)}
		</div>
	)
}
