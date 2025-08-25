"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileText, X, Download } from "lucide-react";
import { useServerAction } from "zsa-react";
import { uploadInvoiceAction, getInvoiceDownloadUrlAction } from "@/lib/actions/invoiceActions";
import { toast } from "sonner";

interface InvoiceUploadModalProps {
    carVin: string;
    invoiceType: "PURCHASE" | "SHIPPING" | "TOTAL";
    trigger?: React.ReactNode;
    onUploadSuccess?: () => void;
    hasInvoice?: boolean; // Add prop to indicate if invoice exists
}

export function InvoiceUploadModal({
    carVin,
    invoiceType,
    trigger,
    onUploadSuccess,
    hasInvoice = false, // Default to false if not provided
}: InvoiceUploadModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [localHasInvoice, setLocalHasInvoice] = useState(hasInvoice);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update local state when prop changes
    useEffect(() => {
        setLocalHasInvoice(hasInvoice);
    }, [hasInvoice]);

    const { execute: executeUpload } = useServerAction(uploadInvoiceAction, {
        onSuccess: (response) => {
            console.log("Upload success response:", response);
            if (response.data.replaced) {
                toast.success("Invoice updated successfully");
            } else {
                toast.success("Invoice uploaded successfully");
            }
            // Set local state to show download button
            setLocalHasInvoice(true);
            setIsOpen(false);
            setSelectedFile(null);
            onUploadSuccess?.();
        },
        onError: (error) => {
            console.error("Upload error in onError:", error);
            // Handle different error types from zsa-react
            if (error && typeof error === 'object' && 'message' in error) {
                toast.error(`Upload failed: ${error.message}`);
            } else if (error && typeof error === 'string') {
                toast.error(`Upload failed: ${error}`);
            } else {
                toast.error("Failed to upload invoice");
            }
        },
    });

    const { execute: executeDownload } = useServerAction(getInvoiceDownloadUrlAction, {
        onSuccess: (response) => {
            console.log("Download success response:", response);
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = response.data.downloadUrl;
            link.download = response.data.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Invoice download started");
        },
        onError: (error) => {
            console.error("Download error:", error);
            toast.error("Failed to download invoice");
        },
    });

    const handleDownload = async () => {
        try {
            await executeDownload({ carVin, invoiceType });
        } catch (error) {
            console.error("Download error in handleDownload:", error);
            toast.error("Failed to download invoice");
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "image/jpeg",
                "image/png",
                "image/webp",
            ];

            if (!allowedTypes.includes(file.type)) {
                toast.error("Please select a valid file type (PDF, Word, or image)");
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be less than 10MB");
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file");
            return;
        }

        setIsUploading(true);
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            console.log("Starting upload for file:", selectedFile.name, "size:", selectedFile.size);

            // Convert Uint8Array to array of numbers for server action compatibility
            const uint8Array = new Uint8Array(arrayBuffer);
            const numberArray = Array.from(uint8Array);

            const uploadData = {
                carVin,
                invoiceType,
                file: {
                    buffer: numberArray, // Send as array of numbers
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type,
                },
            };

            console.log("Upload data prepared:", { carVin, invoiceType, fileName: selectedFile.name });
            const result = await executeUpload(uploadData);
            console.log("Upload result:", result);

            // The onSuccess callback should handle the success case
            // If we reach here without onSuccess being called, there might be an issue
        } catch (error) {
            console.error("Upload error in handleUpload:", error);
            // This catch block handles unexpected errors (network, etc.)
            // The onError callback handles server action errors
            toast.error("Upload failed: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getInvoiceTypeLabel = () => {
        switch (invoiceType) {
            case "PURCHASE":
                return "Purchase Invoice";
            case "SHIPPING":
                return "Shipping Invoice";
            case "TOTAL":
                return "Total Invoice";
            default:
                return "Invoice";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {getInvoiceTypeLabel()}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Upload {getInvoiceTypeLabel()}</span>
                        {localHasInvoice && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="ml-2"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Upload an invoice file for the {invoiceType.toLowerCase()} payment type.
                        Supported formats: PDF, Word documents, and images (max 10MB).
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="invoice-file">Select File</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="invoice-file"
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                onChange={handleFileSelect}
                                className="flex-1"
                            />
                            {selectedFile && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRemoveFile}
                                    className="shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {selectedFile && (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    {localHasInvoice && (
                        <Button
                            variant="outline"
                            onClick={handleDownload}
                            disabled={isUploading}
                            className="mr-auto"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    )}
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                    >
                        {isUploading ? "Uploading..." : "Upload Invoice"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
