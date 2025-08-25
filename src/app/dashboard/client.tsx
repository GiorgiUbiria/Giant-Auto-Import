"use client";

import { useState, useEffect } from "react";
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

  // Fetch user cars
  const fetchUserCars = async () => {
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
  };

  // Fetch payment history
  const fetchPaymentHistory = async () => {
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
  };

  // Load data on component mount
  useEffect(() => {
    fetchUserCars();
    fetchPaymentHistory();
  }, [userId]);

  // Refresh data function
  const handleRefresh = () => {
    if (activeTab === "cars") {
      fetchUserCars();
    } else if (activeTab === "payments") {
      fetchPaymentHistory();
    }
  };

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
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          VIN
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Vehicle
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {cars.map((car) => (
                        <tr key={car.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle font-mono text-sm">{car.vin}</td>
                          <td className="p-4 align-middle">
                            <div>
                              <div className="font-medium">{car.year} {car.make} {car.model}</div>
                              <div className="text-sm text-muted-foreground">{car.reciever}</div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              {car.hasInvoice?.PURCHASE && (
                                <Badge variant="secondary" className="text-xs">Purchase Invoice</Badge>
                              )}
                              {car.hasInvoice?.SHIPPING && (
                                <Badge variant="secondary" className="text-xs">Shipping Invoice</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/car/${car.vin}`}>View Details</a>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
