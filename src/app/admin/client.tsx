"use client";

import { getUserAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2, Users, Car, PlusCircle, UserPlus, DollarSign, FileText } from "lucide-react";
import { UpdateAdminForm } from "./update-admin-form";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

export const Client = ({ id }: { id: string }) => {
	const t = useTranslations("AdminPanel");
	
	// Optimized React Query configuration to prevent excessive calls
	const { isLoading, data, error } = useServerActionQuery(getUserAction, {
		input: {
			id: id,
		},
		queryKey: ["getUser", id],
		// Add React Query optimization options
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 1,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
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
					{data?.message || t("error")}
				</AlertDescription>
			</Alert>
		)
	}

	const QuickAccessCard = ({ title, description, icon: Icon, href }: { title: string; description: string; icon: any; href: string }) => (
		<Link href={href}>
			<Card className="hover:bg-accent/50 transition-all duration-200 cursor-pointer group h-full">
				<CardHeader className="space-y-2 h-full flex flex-col">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
							<Icon className="h-5 w-5 text-primary" />
						</div>
						<CardTitle className="text-lg leading-tight min-h-[1.5rem] flex items-center">{title}</CardTitle>
					</div>
					<CardDescription className="text-sm leading-relaxed flex-grow">{description}</CardDescription>
				</CardHeader>
			</Card>
		</Link>
	);

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
				<QuickAccessCard
					title={t("quickAccess.users.title")}
					description={t("quickAccess.users.description")}
					icon={Users}
					href="/admin/users"
				/>
				<QuickAccessCard
					title={t("quickAccess.cars.title")}
					description={t("quickAccess.cars.description")}
					icon={Car}
					href="/admin/cars"
				/>
				<QuickAccessCard
					title={t("quickAccess.addCar.title")}
					description={t("quickAccess.addCar.description")}
					icon={PlusCircle}
					href="/admin/add_car"
				/>
				<QuickAccessCard
					title={t("quickAccess.registerUser.title")}
					description={t("quickAccess.registerUser.description")}
					icon={UserPlus}
					href="/admin/signup"
				/>
				<QuickAccessCard
					title={t("quickAccess.pricingManagement.title")}
					description={t("quickAccess.pricingManagement.description")}
					icon={DollarSign}
					href="/admin/pricing"
				/>
				<QuickAccessCard
					title={t("quickAccess.csvManagement.title")}
					description={t("quickAccess.csvManagement.description")}
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
						<CardTitle className="text-xl leading-tight">{t("adminProfile.title")}</CardTitle>
						<CardDescription className="leading-relaxed">{t("adminProfile.description")}</CardDescription>
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
