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
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Paperclip className="h-5 w-5" />
                            Note Attachments
                        </DialogTitle>
                        <DialogDescription>
                            Manage attachments for this note. You can upload up to 10 files (max 10MB each).
                        </DialogDescription>
                    </DialogHeader>

                    {/* Upload Section - Only show for admins */}
                    {isAdmin && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="attachment-files">Select Files</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="attachment-files"
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="*/*"
                                        onChange={handleFileSelect}
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Browse
                                    </Button>
                                </div>
                            </div>

                            {/* Selected Files */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Selected Files ({selectedFiles.length}/10)</Label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="shrink-0"
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
                            <Label>Existing Attachments ({attachments.length})</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center gap-3 p-3 bg-muted rounded-md">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>{formatFileSize(attachment.fileSize)}</span>
                                                <span>{attachment.fileType}</span>
                                                <span>by {attachment.uploadedByUser.fullName}</span>
                                                <span>{formatDate(attachment.uploadedAt)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownload(attachment.id)}
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
                                            </Button>
                                            {isAdmin && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(attachment.id)}
                                                    className="text-red-600 hover:text-red-700"
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

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        {isAdmin && selectedFiles.length > 0 && (
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                            >
                                {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
