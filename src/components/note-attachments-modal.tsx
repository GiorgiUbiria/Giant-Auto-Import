"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Download, X, Paperclip, Trash2 } from "lucide-react";
import { uploadNoteAttachmentsAction, getNoteAttachmentsAction, deleteNoteAttachmentAction, getNoteAttachmentDownloadUrlAction } from "@/lib/actions/noteAttachmentActions";
import { toast } from "sonner";

interface NoteAttachment {
    id: number;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: Date;
    uploadedByUser: {
        fullName: string;
    };
}

interface NoteAttachmentsModalProps {
    noteId: number;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    trigger?: React.ReactNode;
    hasAttachments: boolean;
    isAdmin?: boolean; // New prop to control upload functionality
}

export function NoteAttachmentsModal({
    noteId,
    isOpen,
    onOpenChange,
    trigger,
    hasAttachments,
    isAdmin = false, // Default to false (customer view)
}: NoteAttachmentsModalProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [localHasAttachments, setLocalHasAttachments] = useState(hasAttachments);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load attachments when modal opens
    useEffect(() => {
        if (isOpen && localHasAttachments) {
            loadAttachments();
        }
    }, [isOpen, localHasAttachments]);

    // Sync local state with prop
    useEffect(() => {
        setLocalHasAttachments(hasAttachments);
    }, [hasAttachments]);

    const loadAttachments = async () => {
        try {
            const [result, error] = await getNoteAttachmentsAction({ noteId });
            if (error) {
                throw error;
            }
            setAttachments(result);
        } catch (error) {
            console.error("Failed to load attachments:", error);
            toast.error("Failed to load attachments");
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        // Check file count limit
        if (selectedFiles.length + files.length > 10) {
            toast.error("Maximum 10 files allowed");
            return;
        }

        // Check file size (10MB limit)
        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        try {
            const filesData = await Promise.all(
                selectedFiles.map(async (file) => {
                    // If file type is missing, try to infer from extension
                    let fileType = file.type;
                    if (!fileType || fileType === '') {
                        const extension = file.name.split('.').pop()?.toLowerCase();
                        if (extension) {
                            // Map common extensions to MIME types
                            const mimeTypes: { [key: string]: string } = {
                                'pdf': 'application/pdf',
                                'doc': 'application/msword',
                                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                'txt': 'text/plain',
                                'rtf': 'application/rtf',
                                'jpg': 'image/jpeg',
                                'jpeg': 'image/jpeg',
                                'png': 'image/png',
                                'gif': 'image/gif',
                                'webp': 'image/webp',
                                'bmp': 'image/bmp',
                                'svg': 'image/svg+xml',
                                'xls': 'application/vnd.ms-excel',
                                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                'ppt': 'application/vnd.ms-powerpoint',
                                'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                                'zip': 'application/zip',
                                'rar': 'application/x-rar-compressed',
                                '7z': 'application/x-7z-compressed',
                                'tar': 'application/x-tar',
                                'gz': 'application/gzip'
                            };
                            fileType = mimeTypes[extension] || `application/octet-stream`;
                        } else {
                            fileType = 'application/octet-stream';
                        }
                    }

                    return {
                        fileName: file.name,
                        buffer: Array.from(new Uint8Array(await file.arrayBuffer())),
                        fileType: fileType,
                        fileSize: file.size,
                    };
                })
            );

            const [result, error] = await uploadNoteAttachmentsAction({
                noteId,
                files: filesData,
            });

            if (error) {
                throw error;
            }

            toast.success("Attachments uploaded successfully");
            setSelectedFiles([]);
            setLocalHasAttachments(true);
            await loadAttachments();
            onOpenChange(false);
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Failed to upload attachments");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async (attachmentId: number) => {
        try {
            const [result, error] = await getNoteAttachmentDownloadUrlAction({ attachmentId });

            if (error) {
                throw error;
            }

            // Open in new tab instead of downloading
            window.open(result.downloadUrl, '_blank');
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download attachment");
        }
    };

    const handleDelete = async (attachmentId: number) => {
        if (!confirm("Are you sure you want to delete this attachment?")) return;

        try {
            const [result, error] = await deleteNoteAttachmentAction({ attachmentId });

            if (error) {
                throw error;
            }

            toast.success("Attachment deleted successfully");
            await loadAttachments();

            // Check if we still have attachments
            if (attachments.length <= 1) {
                setLocalHasAttachments(false);
            }
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete attachment");
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            {trigger && (
                <div onClick={() => onOpenChange(true)}>
                    {trigger}
                </div>
            )}

            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 -m-6 mb-6 p-6 border-b border-gray-200 dark:border-gray-600">
                        <DialogTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <Paperclip className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Note Attachments
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Manage attachments for this note. You can upload up to 10 files (max 10MB each).
                        </DialogDescription>
                    </DialogHeader>

                    {/* Upload Section - Only show for admins */}
                    {isAdmin && (
                        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="space-y-3">
                                <Label htmlFor="attachment-files" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Select Files
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="attachment-files"
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="*/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Browse Files
                                    </Button>
                                </div>
                            </div>

                            {/* Selected Files */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Selected Files ({selectedFiles.length}/10)
                                    </Label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-600 rounded-md border border-gray-200 dark:border-gray-500">
                                                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">{file.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="shrink-0 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Existing Attachments */}
                    {localHasAttachments && (
                        <div className="space-y-4">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Existing Attachments ({attachments.length})
                            </Label>
                            <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                                {attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">{attachment.fileName}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                                    {formatFileSize(attachment.fileSize)}
                                                </span>
                                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                                    {attachment.fileType}
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    by {attachment.uploadedByUser.fullName}
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-500">
                                                    {formatDate(attachment.uploadedAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownload(attachment.id)}
                                                className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
                                            </Button>
                                            {isAdmin && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(attachment.id)}
                                                    className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-600 -m-6 mt-6 p-6 bg-gray-50 dark:bg-gray-800">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isUploading}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        {isAdmin && selectedFiles.length > 0 && (
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
