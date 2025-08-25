"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Upload, Download, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useServerAction } from "zsa-react";
import { addPaymentAction, getPaymentHistoryAction } from "@/lib/actions/paymentActions";
import { checkInvoiceExistsAction, getInvoiceDownloadUrlAction } from "@/lib/actions/invoiceActions";
import { InvoiceUploadModal } from "./invoice-upload-modal";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentInputProps {
    carVin: string;
    currentAmount: number;
    paymentType: "PURCHASE" | "SHIPPING";
    initialAmount: number;
    onPaymentAdded: () => void;
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

export function PaymentInput({
    carVin,
    currentAmount,
    paymentType,
    initialAmount,
    onPaymentAdded,
    paymentHistory: initialPaymentHistory = [],
    hasInvoice: initialHasInvoice = false,
}: PaymentInputProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(initialPaymentHistory);
    const [hasInvoice, setHasInvoice] = useState(initialHasInvoice);
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    // Remove the useEffect that was making API calls on every render
    // The data now comes from props

    const { execute: executeAddPayment } = useServerAction(addPaymentAction, {
        onSuccess: () => {
            toast.success("Payment added successfully");
            setIsEditing(false);
            setPaymentAmount("");

            // Invalidate payment history and invoice status queries
            queryClient.invalidateQueries({ queryKey: ["paymentHistory", carVin] });
            queryClient.invalidateQueries({ queryKey: ["invoiceStatus", carVin] });

            onPaymentAdded();
        },
        onError: (error) => {
            toast.error("Failed to add payment");
        },
    });

    // Remove the other server action calls that were causing excessive requests
    // const { execute: executeGetPaymentHistory } = useServerAction(getPaymentHistoryAction, {
    //     onSuccess: (response) => { setPaymentHistory(response.data); },
    // });
    // const { execute: executeCheckInvoice } = useServerAction(checkInvoiceExistsAction, {
    //     onSuccess: (response) => { setHasInvoice(response.data.exists); },
    // });

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

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // The useEffect that was making API calls on every render is removed

    const handleDoubleClick = () => {
        if (currentAmount > 0) {
            setIsEditing(true);
        }
    };

    const handleSubmit = async () => {
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (amount > currentAmount) {
            toast.error(`Payment amount cannot exceed ${paymentType.toLowerCase()} due amount`);
            return;
        }

        setIsSubmitting(true);
        try {
            await executeAddPayment({
                carVin,
                amount,
                paymentType,
                description: `${paymentType} payment`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setPaymentAmount("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSubmit();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    };

    const handleUploadInvoice = () => {
        // This will be handled by the InvoiceUploadModal
        // The modal will open when the button is clicked
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    if (isEditing) {
        return (
            <div className="space-y-2">
                <Input
                    ref={inputRef}
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter payment amount"
                    className="w-24"
                    min="0"
                    max={currentAmount}
                    step="0.01"
                />
                <div className="flex gap-1">
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="h-6 px-2 text-xs"
                    >
                        {isSubmitting ? "..." : "Save"}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        className="h-6 px-2 text-xs"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <HoverCard>
                <HoverCardTrigger asChild>
                    <div
                        className="cursor-pointer hover:text-primary/80 transition-colors font-medium"
                        onDoubleClick={handleDoubleClick}
                    >
                        {formatCurrency(currentAmount)}
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Initial {paymentType} Fee</h3>
                            <div className="text-primary font-medium">
                                {formatCurrency(initialAmount)}
                            </div>
                        </div>

                        {paymentHistory.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Payment History</h3>
                                <div className="space-y-2">
                                    {paymentHistory
                                        .filter(payment => payment.paymentType === paymentType)
                                        .map((payment) => (
                                            <div key={payment.id} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span>{formatDate(payment.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3 text-red-500" />
                                                    <span className="text-red-500 font-medium">
                                                        -{formatCurrency(payment.amount)}
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
                                invoiceType={paymentType}
                                hasInvoice={hasInvoice}
                                trigger={
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Upload className="h-3 w-3 mr-1" />
                                        Upload Invoice
                                    </Button>
                                }
                                onUploadSuccess={() => {
                                    // Update local invoice status
                                    setHasInvoice(true);
                                    // Trigger refresh to update parent component
                                    onPaymentAdded();
                                }}
                            />
                            {hasInvoice && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => executeDownloadInvoice({ carVin, invoiceType: paymentType })}
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
                        onClick={() => executeDownloadInvoice({ carVin, invoiceType: paymentType })}
                        className="text-xs px-2 py-1 h-6"
                    >
                        <Download className="h-3 w-3 mr-1" />
                        Download Invoice
                    </Button>
                </div>
            )}
        </div>
    );
}
