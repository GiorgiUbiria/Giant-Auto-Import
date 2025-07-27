"use client";

import { getUserAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2, Users, Car, PlusCircle, UserPlus, DollarSign, FileText } from "lucide-react";
import { UpdateAdminForm } from "./update-admin-form";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Client = ({ id }: { id: string }) => {
	const { isLoading, data, error } = useServerActionQuery(getUserAction, {
		input: {
			id: id,
		},
		queryKey: ["getUser", id],
	})

	const LoadingState = () => {
		return (
			<div className="w-full h-40 grid place-items-center">
				<Loader2 className="animate-spin text-primary" size={32} />
			</div>
		)
	}

	const ErrorState = () => {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					{data?.message || "Failed to load user data. Please try refreshing the page."}
				</AlertDescription>
			</Alert>
		)
	}

	const QuickAccessCard = ({ title, description, icon: Icon, href }: { title: string; description: string; icon: any; href: string }) => (
		<Link href={href}>
			<Card className="hover:bg-accent/50 transition-all duration-200 cursor-pointer group">
				<CardHeader className="space-y-2">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
							<Icon className="h-5 w-5 text-primary" />
						</div>
						<CardTitle className="text-lg">{title}</CardTitle>
					</div>
					<CardDescription className="text-sm">{description}</CardDescription>
				</CardHeader>
			</Card>
		</Link>
	);

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<QuickAccessCard
					title="Users"
					description="Manage user accounts and permissions"
					icon={Users}
					href="/admin/users"
				/>
				<QuickAccessCard
					title="Cars"
					description="Browse and manage imported vehicles"
					icon={Car}
					href="/admin/cars"
				/>
				<QuickAccessCard
					title="Add Car"
					description="Add new vehicles to inventory"
					icon={PlusCircle}
					href="/admin/add_car"
				/>
				<QuickAccessCard
					title="Register User"
					description="Create new user accounts"
					icon={UserPlus}
					href="/admin/signup"
				/>
				<QuickAccessCard
					title="Pricing Management"
					description="Configure default and user-specific pricing"
					icon={DollarSign}
					href="/admin/pricing"
				/>
				<QuickAccessCard
					title="CSV Management"
					description="Upload and manage pricing CSV data"
					icon={FileText}
					href="/admin/csv-management"
				/>
			</div>

			{isLoading ? (
				<LoadingState />
			) : error || !data?.success ? (
				<ErrorState />
			) : data?.user ? (
				<Card className="border-t">
					<CardHeader>
						<CardTitle className="text-xl">Admin Profile</CardTitle>
						<CardDescription>Update your account information and preferences</CardDescription>
					</CardHeader>
					<CardContent>
						<UpdateAdminForm user={data.user} />
					</CardContent>
				</Card>
			) : (
				<ErrorState />
			)}
		</div>
	)
}
