"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table";
import { getUserAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2, Pencil } from "lucide-react";
import { columns } from "./columns";
import { UpdateProfileForm } from "./edit-profile-form";
import { UserPricingForm } from "./pricing-form";
import { AdminCustomerNotes } from "@/components/admin-customer-notes";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Suspense } from "react";
import { SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";

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

	// Table state
	const [pageIndex, setPageIndex] = React.useState(0);
	const [pageSize, setPageSize] = React.useState(20);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [filters, setFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});

	if (isLoading) {
		return <LoadingState />;
	}

	if (error || !data?.success || !data?.user) {
		return <ErrorState message={data?.message} />;
	}

	// Client-side filtering
	let filteredData = data.cars ?? [];
	filters.forEach(f => {
		if (f.value && filteredData.length > 0 && Object.prototype.hasOwnProperty.call(filteredData[0], f.id)) {
			filteredData = filteredData.filter((row: Record<string, any>) => String(row[f.id as keyof typeof row] ?? '').toLowerCase().includes(String(f.value).toLowerCase()));
		}
	});

	// Client-side sorting
	if (sorting.length > 0) {
		const { id, desc } = sorting[0];
		filteredData = [...filteredData].sort((a: Record<string, any>, b: Record<string, any>) => {
			const aValue = a[id as keyof typeof a];
			const bValue = b[id as keyof typeof b];
			if (aValue < bValue) return desc ? 1 : -1;
			if (aValue > bValue) return desc ? -1 : 1;
			return 0;
		});
	}

	// Client-side pagination
	const rowCount = filteredData.length;
	const paginatedData = filteredData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

	// Handlers
	const handlePaginationChange = ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
		setPageIndex(pageIndex);
		setPageSize(pageSize);
	};
	const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
		setSorting(typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue);
	};
	const handleFiltersChange = (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
		setFilters(typeof updaterOrValue === "function" ? updaterOrValue(filters) : updaterOrValue);
	};
	const handleColumnVisibilityChange = (updaterOrValue: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
		setColumnVisibility(typeof updaterOrValue === "function" ? updaterOrValue(columnVisibility) : updaterOrValue);
	};
	const handleRowSelectionChange = (updaterOrValue: any | ((old: any) => any)) => {
		setRowSelection(typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue);
	};

	return (
		<div className="space-y-8">
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

						{/* User Pricing Configuration */}
			<div className="border rounded-lg p-6">
				<UserPricingForm userId={data.user.id} userName={data.user.fullName} />
			</div>
			
			{/* Customer Notes */}
			<div className="border rounded-lg p-6">
				<AdminCustomerNotes 
					customerId={data.user.id} 
					customerName={data.user.fullName} 
				/>
			</div>
			
			{/* User's Cars */}
			<div>
				<h2 className="text-2xl font-semibold mb-4">User&apos;s Cars</h2>
				<DataTable
					columns={columns}
					data={paginatedData}
					filterKey="vin"
					pageIndex={pageIndex}
					pageSize={pageSize}
					onPaginationChange={handlePaginationChange}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					filters={filters}
					onFiltersChange={handleFiltersChange}
					rowCount={rowCount}
					columnVisibility={columnVisibility}
					onColumnVisibilityChange={handleColumnVisibilityChange}
					rowSelection={rowSelection}
					onRowSelectionChange={handleRowSelectionChange}
				/>
			</div>
		</div>
	)
}
