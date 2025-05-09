"use client";

import { getUserAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2, Users, Car, PlusCircle, UserPlus } from "lucide-react";
import { UpdateAdminForm } from "./update-admin-form";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

	const QuickAccessCard = ({ title, description, icon: Icon, href }: { title: string; description: string; icon: any; href: string }) => (
		<Link href={href}>
			<Card className="hover:bg-accent transition-colors cursor-pointer">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Icon className="h-5 w-5" />
						{title}
					</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
			</Card>
		</Link>
	);

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<QuickAccessCard
					title="Users"
					description="Manage user accounts"
					icon={Users}
					href="/admin/users"
				/>
				<QuickAccessCard
					title="Cars"
					description="View all imported cars"
					icon={Car}
					href="/admin/cars"
				/>
				<QuickAccessCard
					title="Add Car"
					description="Add a new car to the system"
					icon={PlusCircle}
					href="/admin/add_car"
				/>
				<QuickAccessCard
					title="Register User"
					description="Create a new user account"
					icon={UserPlus}
					href="/admin/signup"
				/>
			</div>

			{isLoading ? <LoadingState /> : (
				<Card>
					<CardHeader>
						<CardTitle>Admin Profile</CardTitle>
						<CardDescription>Update your admin account information</CardDescription>
					</CardHeader>
					<CardContent>
						<UpdateAdminForm user={data?.user!} />
					</CardContent>
				</Card>
			)}
		</div>
	)
}
