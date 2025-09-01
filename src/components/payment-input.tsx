"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Upload, Download, DollarSign, Calendar, Edit3, Check, X, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useServerAction } from "zsa-react";
import { addPaymentAction, getPaymentHistoryAction } from "@/lib/actions/paymentActions";
import { checkInvoiceExistsAction, getInvoiceDownloadUrlAction } from "@/lib/actions/invoiceActions";
import { InvoiceUploadModal } from "./invoice-upload-modal";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCacheInvalidation } from "@/lib/services/cache-invalidation-service";
import { ButtonWithLoading, InlineLoading } from "@/components/ui/loading-components";
import { cn } from "@/lib/utils";

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
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(initialPaymentHistory);
    const [hasInvoice, setHasInvoice] = useState(initialHasInvoice);
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const { invalidateOnPaymentChange } = useCacheInvalidation();

    // Remove the useEffect that was making API calls on every render
    // The data now comes from props

    const { execute: executeAddPayment, isPending } = useServerAction(addPaymentAction, {
        onSuccess: async (response) => {
            console.log("Payment success response:", response);
            toast.success("Payment added successfully");
            setIsEditing(false);
            setPaymentAmount("");

            // Use smart cache invalidation for payment changes
            console.log("Starting cache invalidation...");
            await invalidateOnPaymentChange({
                carVin: carVin,
                paymentType: paymentType,
                changeType: 'create'
            }, { refetch: true, activeOnly: true });

            // Also invalidate the specific cars query that the admin page uses
            console.log("Invalidating getCars query...");
            await queryClient.invalidateQueries({
                queryKey: ['getCars'],
                exact: false,
                refetchType: 'active',
            });

            console.log("Cache invalidation completed, calling onPaymentAdded...");
            // Call the parent callback to refresh data
            onPaymentAdded();
        },
        onError: (error) => {
            console.error("Payment error:", error);
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

    const handleDownloadInvoice = async () => {
        try {
            const [result, error] = await getInvoiceDownloadUrlAction({
                carVin,
                invoiceType: paymentType,
            });

            if (error) {
                throw error;
            }

            // Open in new tab instead of downloading
            window.open(result.downloadUrl, '_blank');
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download invoice");
        }
    };

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
        if (isPending) {
            console.log("Payment already in progress, skipping");
            return;
        }

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (amount > currentAmount) {
            toast.error(`Payment amount cannot exceed ${paymentType.toLowerCase()} due amount`);
            return;
        }

        console.log("Submitting payment:", { carVin, amount, paymentType });

        try {
            const result = await executeAddPayment({
                carVin,
                amount,
                paymentType,
                description: `${paymentType} payment`,
            });
            console.log("Payment submission result:", result);
        } catch (error) {
            console.error("Payment submission error:", error);
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

    const getPaymentTypeBg = (type: "PURCHASE" | "SHIPPING") => {
        if (type === "PURCHASE") return "bg-blue-100";
        if (type === "SHIPPING") return "bg-purple-100";
        return "bg-gray-100";
    };

    const getPaymentTypeColor = (type: "PURCHASE" | "SHIPPING") => {
        if (type === "PURCHASE") return "text-blue-600";
        if (type === "SHIPPING") return "text-purple-600";
        return "text-gray-600";
    };

    if (isEditing) {
        return (
            <div className="space-y-2 p-2 bg-background border border-border rounded-md shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                    <Edit3 className="h-3 w-3 text-foreground" />
                    <span className="text-xs font-medium text-foreground">
                        Enter {paymentType.toLowerCase()} payment
                    </span>
                </div>

                <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="0.00"
                        className="pl-7 pr-2 h-8 text-sm font-medium"
                        min="0"
                        max={currentAmount}
                        step="0.01"
                    />
                </div>

                <div className="text-xs text-muted-foreground text-center">
                    Max: {formatCurrency(currentAmount)}
                </div>

                <div className="flex gap-1">
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="flex-1 h-7 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                    >
                        <ButtonWithLoading
                            loading={isPending}
                            loadingText="Processing..."
                            size="sm"
                        >
                            <div className="flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Confirm
                            </div>
                        </ButtonWithLoading>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        className="h-7 px-2 text-xs"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <HoverCard>
                <HoverCardTrigger asChild>
                    <div
                        className={cn(
                            "group relative cursor-pointer transition-all duration-200",
                            "p-2 rounded-md border border-border bg-background",
                            "hover:border-primary/50 hover:shadow-sm"
                        )}
                        onDoubleClick={handleDoubleClick}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "p-1.5 rounded-full",
                                    getPaymentTypeBg(paymentType)
                                )}>
                                    <DollarSign className={cn(
                                        "h-3 w-3",
                                        getPaymentTypeColor(paymentType)
                                    )} />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        {paymentType}
                                    </div>
                                    <div className="text-base font-bold text-foreground">
                                        {formatCurrency(currentAmount)}
                                    </div>
                                </div>
                            </div>

                            {currentAmount > 0 && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsEditing(true)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 h-6 w-6 hover:bg-primary/10"
                                    title="Edit payment"
                                >
                                    <Edit3 className="h-3 w-3 text-primary" />
                                </Button>
                            )}
                        </div>

                        {currentAmount > 0 && (
                            <div className="mt-1 text-xs text-muted-foreground text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                Click edit button or double-click to add payment
                            </div>
                        )}
                    </div>
                </HoverCardTrigger>

                <HoverCardContent className="w-72 p-3" align="end" side="bottom">
                    <div className="space-y-3">
                        {/* Header */}
                        <div className="text-center pb-2 border-b border-border">
                            <h3 className="font-semibold text-sm text-foreground">
                                {paymentType} Details
                            </h3>
                        </div>

                        {/* Initial Fee Section */}
                        <div className="bg-muted/50 p-2 rounded-md border border-border/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                                        Initial {paymentType} Fee
                                    </h4>
                                    <div className="text-base font-bold text-foreground">
                                        {formatCurrency(initialAmount)}
                                    </div>
                                </div>
                                <div className={cn(
                                    "p-1.5 rounded-full",
                                    getPaymentTypeBg(paymentType)
                                )}>
                                    <DollarSign className={cn(
                                        "h-3 w-3",
                                        getPaymentTypeColor(paymentType)
                                    )} />
                                </div>
                            </div>
                        </div>

                        {/* Payment History Section */}
                        {paymentHistory.length > 0 && (
                            <div className="space-y-1.5">
                                <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                                    Payment History
                                </h4>
                                <div className="space-y-1 max-h-20 overflow-y-auto">
                                    {paymentHistory
                                        .filter(payment => payment.paymentType === paymentType)
                                        .map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="flex justify-between items-center p-1.5 bg-muted/30 rounded-md border border-border/50"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-2.5 w-2.5 text-muted-foreground" />
                                                    <div>
                                                        <div className="text-xs font-medium text-foreground">
                                                            {formatDate(payment.createdAt)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            by {payment.admin.fullName}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-2.5 w-2.5 text-destructive" />
                                                    <span className="text-destructive font-semibold text-xs">
                                                        -{formatCurrency(payment.amount)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-1.5">
                            <div className="flex gap-1.5">
                                <InvoiceUploadModal
                                    carVin={carVin}
                                    invoiceType={paymentType}
                                    hasInvoice={hasInvoice}
                                    trigger={
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-7 border-border hover:border-primary text-xs"
                                        >
                                            <Upload className="h-3 w-3 mr-1" />
                                            {hasInvoice ? "Change" : "Upload"}
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
                                        onClick={handleDownloadInvoice}
                                        className="flex-1 h-7 border-border hover:border-primary text-xs"
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                    </Button>
                                )}
                            </div>

                            {hasInvoice && (
                                <div className="flex items-center gap-1.5 p-1.5 bg-primary/5 border border-primary/20 rounded-md">
                                    <FileText className="h-2.5 w-2.5 text-primary" />
                                    <span className="text-xs text-primary font-medium">
                                        Invoice available
                                    </span>
                                </div>
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
                        onClick={handleDownloadInvoice}
                        className="text-xs px-2 py-1 h-6 border-border hover:border-primary"
                    >
                        <Download className="h-3 w-3 mr-1" />
                        Download Invoice
                    </Button>
                </div>
            )}
        </div>
    );
}
