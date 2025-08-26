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
import { Upload, FileText, X, Download, AlertCircle, CheckCircle, FileUp } from "lucide-react";
import { useServerAction } from "zsa-react";
import { uploadInvoiceAction, getInvoiceDownloadUrlAction } from "@/lib/actions/invoiceActions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    const [isDragOver, setIsDragOver] = useState(false);
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
            const [result, error] = await getInvoiceDownloadUrlAction({
                carVin,
                invoiceType,
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

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file: File) => {
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
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            validateAndSetFile(files[0]);
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

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('image')) return '🖼️';
        return '📎';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-primary/10">
                                <FileUp className="h-5 w-5 text-primary" />
                            </div>
                            <span>Upload {getInvoiceTypeLabel()}</span>
                        </div>
                        {localHasInvoice && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="ml-2 hover:bg-primary hover:text-primary-foreground transition-colors"
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
                    {/* File Upload Area */}
                    <div className="space-y-3">
                        <Label htmlFor="invoice-file" className="text-sm font-medium">
                            Select File
                        </Label>

                        {/* Drag & Drop Zone */}
                        <div
                            className={cn(
                                "relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200",
                                isDragOver
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                                selectedFile && "border-primary/50 bg-primary/5"
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {!selectedFile ? (
                                <div className="space-y-3">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {isDragOver ? "Drop your file here" : "Drag & drop your file here"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            or click to browse
                                        </p>
                                    </div>
                                    <Input
                                        id="invoice-file"
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <CheckCircle className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-foreground">
                                            File selected successfully
                                        </p>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-2xl">{getFileIcon(selectedFile.type)}</span>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatFileSize(selectedFile.size)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRemoveFile}
                                        className="mx-auto"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Remove File
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* File Type Info */}
                        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md border border-border/50">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Supported formats:</span> PDF, Word (.doc, .docx), Images (.jpg, .png, .webp)
                                <br />
                                <span className="font-medium">Max size:</span> 10MB
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
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
                            className="mr-auto hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    )}
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className="min-w-[120px]"
                    >
                        {isUploading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Uploading...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Upload Invoice
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
