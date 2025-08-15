"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, DollarSign, Calendar, User, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

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
  customer: {
    id: string;
    fullName: string;
    email: string;
    balance: number;
  };
}

const getPaymentTypeIcon = (type: string) => {
  switch (type) {
    case "WIRE":
      return <DollarSign className="h-4 w-4" />;
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div className="flex items-center gap-2">
          {getPaymentTypeIcon(payment.paymentType)}
          <div>
            <p className="font-medium">{payment.description}</p>
            {payment.note && (
              <p className="text-sm text-muted-foreground truncate max-w-xs">
                {payment.note}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{payment.customer.fullName}</p>
            <p className="text-sm text-muted-foreground">{payment.customer.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div className="text-right">
          <p className="font-medium">{formatCurrency(payment.amount)}</p>
          <p className="text-sm text-muted-foreground">
            Balance: {formatCurrency(payment.customer.balance)}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(payment.paymentDate)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Status",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <Badge className={getPaymentStatusColor(payment.paymentStatus)}>
          {getPaymentStatusIcon(payment.paymentStatus)}
          <span className="ml-1">{payment.paymentStatus}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "invoiceGenerated",
    header: "Invoice",
    cell: ({ row }) => {
      const payment = row.original;
      if (!payment.invoiceGenerated) {
        return <Badge variant="outline">Not Generated</Badge>;
      }
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          {payment.invoiceType} Generated
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id.toString())}
            >
              Copy payment ID
            </DropdownMenuItem>
            {payment.checkNumber && (
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.checkNumber!)}
              >
                Copy check number
              </DropdownMenuItem>
            )}
            {!payment.invoiceGenerated && payment.invoiceType && (
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/invoices/${payment.id}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ invoiceType: payment.invoiceType }),
                    });
                    if (response.ok) {
                      // Open invoice in new tab
                      window.open(`/api/invoices/${payment.id}`, '_blank');
                    }
                  } catch (error) {
                    console.error('Error generating invoice:', error);
                  }
                }}
              >
                Generate {payment.invoiceType} Invoice
              </DropdownMenuItem>
            )}
            {payment.invoiceGenerated && (
              <DropdownMenuItem
                onClick={() => {
                  window.open(`/api/invoices/${payment.id}`, '_blank');
                }}
              >
                View Invoice
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Payment</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
