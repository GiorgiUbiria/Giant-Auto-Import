"use client";

import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";

const paymentFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  description: z.string().min(1, "Description is required"),
  note: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  checkNumber: z.string().optional(),
  paymentType: z.enum(["WIRE", "CASH", "CHECK"]),
  paymentStatus: z.enum(["COMPLETE", "ACTIVE", "CLOSED"]),
  invoiceType: z.enum(["SHIPPING", "PURCHASE", "TOTAL"]).optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface Customer {
  id: string;
  fullName: string;
  email: string;
  balance: number;
}

interface Payment {
  id: number;
  customerId: string;
  paymentDate: string;
  description: string;
  note?: string;
  amount: number;
  checkNumber?: string;
  paymentType: "WIRE" | "CASH" | "CHECK";
  paymentStatus: "COMPLETE" | "ACTIVE" | "CLOSED";
  invoiceGenerated: boolean;
  invoiceType?: "SHIPPING" | "PURCHASE" | "TOTAL";
  customer: Customer;
}

const fetchCustomers = async (): Promise<Customer[]> => {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Failed to fetch customers");
  const data = await response.json();
  return data.users || [];
};

const fetchPayments = async (): Promise<Payment[]> => {
  const response = await fetch("/api/payments");
  if (!response.ok) throw new Error("Failed to fetch payments");
  const data = await response.json();
  return data.payments || [];
};

const createPayment = async (paymentData: PaymentFormData): Promise<any> => {
  const response = await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  });
  if (!response.ok) throw new Error("Failed to create payment");
  return response.json();
};

export function Client() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const queryClient = useQueryClient();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split("T")[0],
      paymentStatus: "ACTIVE",
      paymentType: "WIRE",
    },
  });

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

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: fetchPayments,
  });

  const createPaymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Payment created successfully");
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to create payment");
      console.error("Payment creation error:", error);
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    createPaymentMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (customersLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(customers.reduce((sum, c) => sum + c.balance, 0))} total balance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(p => p.invoiceGenerated).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {payments.length} payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment Management</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Payment</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.fullName} ({formatCurrency(customer.balance)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Payment description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="checkNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Check number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="WIRE">Wire Transfer</SelectItem>
                              <SelectItem value="CASH">Cash</SelectItem>
                              <SelectItem value="CHECK">Check</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="COMPLETE">Complete</SelectItem>
                              <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="invoiceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Type (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select invoice type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SHIPPING">Shipping</SelectItem>
                              <SelectItem value="PURCHASE">Purchase</SelectItem>
                              <SelectItem value="TOTAL">Total</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createPaymentMutation.isPending}
                    >
                      {createPaymentMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Create Payment
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={payments}
            filterKey="description"
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPaginationChange={handlePaginationChange}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            rowCount={payments.length}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            rowSelection={rowSelection}
            onRowSelectionChange={handleRowSelectionChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
