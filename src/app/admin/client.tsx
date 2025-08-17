"use client";

import { getUserAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2, Users, Car, PlusCircle, UserPlus, DollarSign, FileText } from "lucide-react";
import { UpdateAdminForm } from "./update-admin-form";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import {
	adminUserAtom,
	adminLoadingAtom,
	adminErrorAtom,
	resetAdminFormAtom,
	addActivityLogAtom,
} from '@/lib/admin-atoms';

export const Client = ({ id }: { id: string }) => {
	const t = useTranslations("AdminPanel");

	// Jotai atoms
	const [adminUser, setAdminUser] = useAtom(adminUserAtom);
	const [loading, setLoading] = useAtom(adminLoadingAtom);
	const [error, setError] = useAtom(adminErrorAtom);
	const [, resetForm] = useAtom(resetAdminFormAtom);
	const [, addActivity] = useAtom(addActivityLogAtom);

	// Optimized React Query configuration to prevent excessive calls
	const { isLoading, data, error: queryError } = useServerActionQuery(getUserAction, {
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
	});

	// Sync React Query state with Jotai atoms
	useEffect(() => {
		setLoading(isLoading);

		if (queryError) {
			setError(queryError.message || t("error"));
		} else if (data) {
			setError(null);

			// Safe data validation with better type checking
			const isValidData = data && typeof data === 'object' && 'success' in data;
			const hasValidUser = isValidData && data.success && data.user && typeof data.user === 'object' && 'id' in data.user;

			if (hasValidUser && data.user) {
				setAdminUser(data.user);
				resetForm(data.user);
				addActivity({
					action: 'Admin panel accessed',
					details: `Admin user ${data.user.fullName} accessed the admin panel`,
					userId: data.user.id,
				});
			} else {
				setError(data?.message || t("error"));
			}
		}
	}, [isLoading, data, queryError, setLoading, setError, setAdminUser, resetForm, addActivity, t]);

	// Validate input
	if (!id || typeof id !== 'string') {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					{t("error")}
				</AlertDescription>
			</Alert>
		);
	}

	const LoadingState = () => {
		return (
			<div className="w-full h-40 grid place-items-center">
				<Loader2 className="animate-spin text-primary" size={32} />
			</div>
		)
	}

	const ErrorState = () => {
		// Safe error message extraction
		const errorMessage = error || t("error");
		return (
			<Alert variant="destructive">
				<AlertDescription>
					{errorMessage}
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
				<QuickAccessCard
					title="Payment Management"
					description="Manage customer payments and generate invoices"
					icon={DollarSign}
					href="/admin/payments"
				/>
			</div>

			{loading ? (
				<LoadingState />
			) : error || !adminUser ? (
				<ErrorState />
			) : (
				<Card className="border-t">
					<CardHeader>
						<CardTitle className="text-xl leading-tight">{t("adminProfile.title")}</CardTitle>
						<CardDescription className="leading-relaxed">{t("adminProfile.description")}</CardDescription>
					</CardHeader>
					<CardContent>
						<UpdateAdminForm user={adminUser} />
					</CardContent>
				</Card>
			)}
		</div>
	)
}
