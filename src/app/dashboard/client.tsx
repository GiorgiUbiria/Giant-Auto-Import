"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, CreditCard, FileText, RefreshCw } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { SelectSchemaType } from "./columns";
import { CustomerNotes } from "@/components/customer-notes";
import { getUserPaymentHistoryAction } from "@/lib/actions/paymentActions";
import { toast } from "sonner";
import * as React from "react";
import { SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";

interface CarsApiResponse {
  cars: SelectSchemaType[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface PaymentHistoryItem {
  id: number;
  amount: number;
  description: string | null;
  createdAt: Date; // Changed from paymentDate to match server response
  paymentType: string;
  carVin: string;
  car: {
    make: string;
    model: string;
    year: number;
  };
}

interface DashboardClientProps {
  userId: string;
}

export function Client({ userId }: DashboardClientProps) {
  const t = useTranslations("Dashboard");
  const [cars, setCars] = useState<(SelectSchemaType & {
    hasInvoice?: {
      PURCHASE: boolean;
      SHIPPING: boolean;
      TOTAL: boolean;
    };
  })[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cars");

  // DataTable state
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const fetchUserCars = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/cars?ownerId=${userId}&includeDetails=true`);
      if (!response.ok) {
        throw new Error("Failed to fetch cars");
      }
      const data: CarsApiResponse = await response.json();
      setCars(data.cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("Failed to load cars");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchPaymentHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const [result, error] = await getUserPaymentHistoryAction({ userId });
      if (error) {
        throw error;
      }
      setPaymentHistory(result);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      toast.error("Failed to load payment history");
    }
  }, [userId]);

  // Load data on component mount
  useEffect(() => {
    fetchUserCars();
    fetchPaymentHistory();
  }, [userId, fetchUserCars, fetchPaymentHistory]);

  // Refresh data function
  const handleRefresh = () => {
    if (activeTab === "cars") {
      fetchUserCars();
    } else if (activeTab === "payments") {
      fetchPaymentHistory();
    }
  };

  // DataTable handlers
  const handlePaginationChange = React.useCallback(({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
    setPageIndex(pageIndex);
    setPageSize(pageSize);
  }, []);

  const handleSortingChange = React.useCallback((updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    setSorting(typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue);
  }, [sorting]);

  const handleFiltersChange = React.useCallback((updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
    setFilters(typeof updaterOrValue === "function" ? updaterOrValue(filters) : updaterOrValue);
  }, [filters]);

  const handleColumnVisibilityChange = React.useCallback((updaterOrValue: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
    setColumnVisibility(typeof updaterOrValue === "function" ? updaterOrValue(columnVisibility) : updaterOrValue);
  }, [columnVisibility]);

  const handleRowSelectionChange = React.useCallback((updaterOrValue: any | ((old: any) => any)) => {
    setRowSelection(typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue);
  }, [rowSelection]);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "cars":
        return <Car className="h-4 w-4" />;
      case "payments":
        return <CreditCard className="h-4 w-4" />;
      case "notes":
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case "cars":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Your Vehicles</h3>
                <p className="text-sm text-muted-foreground">
                  {cars.length} vehicle{cars.length !== 1 ? 's' : ''} in your account
                </p>
              </div>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <DataTable
                  columns={columns}
                  data={cars}
                  filterKey="vinDetails"
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  onPaginationChange={handlePaginationChange}
                  sorting={sorting}
                  onSortingChange={handleSortingChange}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  rowCount={cars.length}
                  columnVisibility={columnVisibility}
                  onColumnVisibilityChange={handleColumnVisibilityChange}
                  rowSelection={rowSelection}
                  onRowSelectionChange={handleRowSelectionChange}
                  translations={{
                    searchPlaceholder: "Search by VIN or Lot Number...",
                    columns: "Columns",
                    noResults: "No results found",
                    noData: "No cars found",
                    clearFilter: "Clear filters",
                    pagination: {
                      showing: "Showing",
                      rowsPerPage: "Rows per page",
                      page: "Page",
                      goToFirst: "Go to first page",
                      goToPrevious: "Go to previous page",
                      goToNext: "Go to next page",
                      goToLast: "Go to last page",
                    }
                  }}
                />
              </div>
            )}
          </div>
        );

      case "payments":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Payment History</h3>
                <p className="text-sm text-muted-foreground">
                  Track all your payments and transactions
                </p>
              </div>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            {paymentHistory.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No payment history found
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {payment.car.year} {payment.car.make} {payment.car.model}
                            </h4>
                            <Badge variant="secondary">{payment.carVin}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {payment.description || "Payment"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            ${payment.amount.toLocaleString()}
                          </p>
                          <Badge variant="outline">{payment.paymentType}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case "notes":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Notes & Attachments</h3>
                <p className="text-sm text-muted-foreground">
                  View important notes and files from our team
                </p>
              </div>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <CustomerNotes userId={userId} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-4 md:px-6 pb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cars" className="flex items-center gap-2">
            {getTabIcon("cars")}
            Cars ({cars.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            {getTabIcon("payments")}
            Payment History ({paymentHistory.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            {getTabIcon("notes")}
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {getTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
