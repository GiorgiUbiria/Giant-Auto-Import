"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Calendar, DollarSign, Upload, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useServerAction } from "zsa-react";
import { getPaymentHistoryAction } from "@/lib/actions/paymentActions";
import { checkInvoiceExistsAction, getInvoiceDownloadUrlAction } from "@/lib/actions/invoiceActions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { InvoiceUploadModal } from "./invoice-upload-modal";

interface TotalDueDisplayProps {
    carVin: string;
    totalDue: number;
    paidAmount: number;
    onRefresh: () => void;
    // Add props for data that was previously fetched via API calls
    paymentHistory?: PaymentHistoryItem[];
    hasInvoice?: boolean;
}

interface PaymentHistoryItem {
    id: number;
    amount: number;
    paymentType: string;
    description: string | null;
    createdAt: Date;
    admin: {
        fullName: string;
    };
}

export function TotalDueDisplay({
    carVin,
    totalDue,
    paidAmount,
    onRefresh,
    paymentHistory: initialPaymentHistory = [],
    hasInvoice: initialHasInvoice = false,
}: TotalDueDisplayProps) {
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(initialPaymentHistory);
    const [hasInvoice, setHasInvoice] = useState(initialHasInvoice);
    const queryClient = useQueryClient();

    // Remove the useEffect that was making API calls on every render
    // The data now comes from props

    const { execute: executeDownloadInvoice } = useServerAction(getInvoiceDownloadUrlAction, {
        onSuccess: (response) => {
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = response.data.downloadUrl;
            link.download = response.data.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        onError: (error) => {
            toast.error("Failed to download invoice");
        },
    });

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);

    return (
        <div className="space-y-2">
            <HoverCard>
                <HoverCardTrigger asChild>
                    <div className="cursor-pointer hover:text-primary/80 transition-colors font-medium">
                        {formatCurrency(totalDue)}
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Payment Summary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Total Due:</span>
                                    <span className="font-medium text-red-600">
                                        {formatCurrency(totalDue + paidAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Total Paid:</span>
                                    <span className="font-medium text-green-600">
                                        {formatCurrency(paidAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-t pt-2">
                                    <span className="font-semibold">Remaining Due:</span>
                                    <span className="font-semibold text-primary">
                                        {formatCurrency(totalDue)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {paymentHistory.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Payment History</h3>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {paymentHistory.map((payment) => (
                                        <div key={payment.id} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                <span>{formatDate(payment.createdAt)}</span>
                                                <span className="text-muted-foreground">
                                                    by {payment.admin.fullName}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-3 w-3 text-green-500" />
                                                <span className="text-green-500 font-medium">
                                                    +{formatCurrency(payment.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <InvoiceUploadModal
                                carVin={carVin}
                                invoiceType="TOTAL"
                                hasInvoice={hasInvoice}
                                trigger={
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Upload className="h-3 w-3 mr-1" />
                                        Upload Total Invoice
                                    </Button>
                                }
                                onUploadSuccess={() => {
                                    // Trigger refresh to update invoice status
                                    onRefresh();
                                }}
                            />
                            {hasInvoice && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => executeDownloadInvoice({ carVin, invoiceType: "TOTAL" })}
                                    className="flex-1"
                                >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                </Button>
                            )}
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
            
            {/* Download button displayed under the price when invoice exists */}
            {hasInvoice && (
                <div className="flex justify-center">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => executeDownloadInvoice({ carVin, invoiceType: "TOTAL" })}
                        className="text-xs px-2 py-1 h-6"
                    >
                        <Download className="h-3 w-3 mr-1" />
                        Download Total Invoice
                    </Button>
                </div>
            )}
        </div>
    );
}
