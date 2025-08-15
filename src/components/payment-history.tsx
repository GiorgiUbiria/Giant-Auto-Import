"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, FileText, CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface PaymentHistoryItem {
  id: number;
  paymentDate: string;
  description: string;
  note?: string;
  amount: number;
  checkNumber?: string;
  paymentType: "WIRE" | "CASH" | "CHECK";
  paymentStatus: "COMPLETE" | "ACTIVE" | "CLOSED";
  invoiceGenerated: boolean;
  invoiceType?: "SHIPPING" | "PURCHASE" | "TOTAL";
  paymentCars: Array<{
    id: number;
    carId: number;
    amount: number;
    car: {
      vin: string;
      year: number;
      make: string;
      model: string;
    };
  }>;
}

interface PaymentHistoryProps {
  userId: string;
  balance: number;
}

const getPaymentTypeIcon = (type: string) => {
  switch (type) {
    case "WIRE":
      return <CreditCard className="h-4 w-4" />;
    case "CASH":
      return <DollarSign className="h-4 w-4" />;
    case "CHECK":
      return <FileText className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

const getPaymentStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETE":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "ACTIVE":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "CLOSED":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETE":
      return "bg-green-100 text-green-800";
    case "ACTIVE":
      return "bg-yellow-100 text-yellow-800";
    case "CLOSED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function PaymentHistory({ userId, balance }: PaymentHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPaymentHistory = async () => {
    if (isOpen) return; // Already loaded
    
    setLoading(true);
    try {
      const response = await fetch(`/api/payments?customerId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchPaymentHistory();
    }
    setIsOpen(!isOpen);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Payment History</CardTitle>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Current Balance</p>
            <p className="text-lg font-bold">{formatCurrency(balance)}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={loading}
          >
            {isOpen ? "Hide" : "Show"} Payment History
          </Button>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment history found</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {payments.map((payment) => (
                <AccordionItem key={payment.id} value={payment.id.toString()}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        {getPaymentTypeIcon(payment.paymentType)}
                        <div className="text-left">
                          <p className="font-medium">{payment.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(payment.paymentDate)}</span>
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCurrency(payment.amount)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPaymentStatusColor(payment.paymentStatus)}>
                          {getPaymentStatusIcon(payment.paymentStatus)}
                          <span className="ml-1">{payment.paymentStatus}</span>
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {payment.note && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Note:</h4>
                          <p className="text-sm text-muted-foreground">{payment.note}</p>
                        </div>
                      )}
                      
                      {payment.checkNumber && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Check Number:</h4>
                          <p className="text-sm text-muted-foreground">{payment.checkNumber}</p>
                        </div>
                      )}
                      
                      {payment.invoiceGenerated && payment.invoiceType && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Invoice:</h4>
                          <Badge variant="outline">{payment.invoiceType} Invoice Generated</Badge>
                        </div>
                      )}
                      
                      {payment.paymentCars.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Allocated to Cars:</h4>
                          <div className="space-y-2">
                            {payment.paymentCars.map((paymentCar) => (
                              <div key={paymentCar.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                <div>
                                  <p className="text-sm font-medium">
                                    {paymentCar.car.year} {paymentCar.car.make} {paymentCar.car.model}
                                  </p>
                                  <p className="text-xs text-muted-foreground">VIN: {paymentCar.car.vin}</p>
                                </div>
                                <p className="text-sm font-medium">{formatCurrency(paymentCar.amount)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      )}
    </Card>
  );
}
