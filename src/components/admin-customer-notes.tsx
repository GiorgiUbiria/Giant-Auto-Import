"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, User, Plus, Edit, Trash2, MessageSquare, Paperclip, Eye, Upload, X, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { NoteAttachmentsModal } from "./note-attachments-modal";
import { uploadNoteAttachmentsAction } from "@/lib/actions/noteAttachmentActions";

// Collapsible Note Component
interface CollapsibleNoteProps {
    note: string;
    maxLength?: number;
}

function CollapsibleNote({ note, maxLength = 200 }: CollapsibleNoteProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = note.length > maxLength;

    if (!shouldTruncate) {
        return (
            <div className="min-w-0">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                    {note}
                </p>
            </div>
        );
    }

    return (
        <div className="min-w-0 space-y-2">
            <div className="overflow-hidden">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {isExpanded ? note : `${note.slice(0, maxLength)}...`}
                </p>
            </div>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground self-start transition-colors"
                title={isExpanded ? "Show less of this note" : "Show more of this note"}
            >
                {isExpanded ? (
                    <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show Less
                    </>
                ) : (
                    <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show More
                    </>
                )}
            </Button>
        </div>
    );
}

interface CustomerNote {
    id: number;
    note: string;
    isImportant: boolean;
    hasAttachments: boolean;
    createdAt: string;
    updatedAt: string;
    adminName: string;
}

interface AdminCustomerNotesProps {
    customerId: string;
    customerName: string;
}

export function AdminCustomerNotes({ customerId, customerName }: AdminCustomerNotesProps) {
    // Admin component: Shows all notes for comprehensive management
    const [notes, setNotes] = useState<CustomerNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<CustomerNote | null>(null);
    const [formData, setFormData] = useState({
        note: "",
        isImportant: false,
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
    const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchNotes = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/customer-notes?customerId=${customerId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }

            const data = await response.json();
            setNotes(data.notes || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingNote
                ? `/api/customer-notes`
                : `/api/customer-notes`;

            const method = editingNote ? 'PUT' : 'POST';
            const body = editingNote
                ? { id: editingNote.id, ...formData }
                : { customerId, ...formData };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Failed to save note');
            }

            const result = await response.json();
            const noteId = editingNote ? editingNote.id : result.note.id;

            // Upload attachments if any files are selected
            if (selectedFiles.length > 0) {
                setIsUploadingAttachments(true);
                try {
                    const filesData = await Promise.all(
                        selectedFiles.map(async (file) => ({
                            fileName: file.name,
                            buffer: Array.from(new Uint8Array(await file.arrayBuffer())),
                            fileType: file.type,
                            fileSize: file.size,
                        }))
                    );

                    const [uploadResult, uploadError] = await uploadNoteAttachmentsAction({
                        noteId,
                        files: filesData,
                    });

                    if (uploadError) {
                        throw uploadError;
                    }

                    toast.success(`Note ${editingNote ? 'updated' : 'added'} successfully with ${selectedFiles.length} attachment${selectedFiles.length !== 1 ? 's' : ''}`);
                } catch (uploadErr) {
                    console.error("Failed to upload attachments:", uploadErr);
                    toast.error("Note saved but failed to upload attachments");
                } finally {
                    setIsUploadingAttachments(false);
                }
            } else {
                toast.success(editingNote ? 'Note updated successfully' : 'Note added successfully');
            }

            setIsDialogOpen(false);
            setEditingNote(null);
            setFormData({ note: "", isImportant: false });
            setSelectedFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            fetchNotes();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save note');
        }
    };

    const handleDelete = async (noteId: number) => {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            const response = await fetch(`/api/customer-notes?id=${noteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            toast.success('Note deleted successfully');
            fetchNotes();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete note');
        }
    };

    const handleEdit = (note: CustomerNote) => {
        setEditingNote(note);
        setFormData({
            note: note.note,
            isImportant: note.isImportant,
        });
        setSelectedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingNote(null);
        setFormData({ note: "", isImportant: false });
        setSelectedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsDialogOpen(true);
    };

    const handleViewAttachments = (noteId: number) => {
        setSelectedNoteId(noteId);
        setAttachmentsModalOpen(true);
    };

    const handleAttachmentsModalClose = () => {
        setAttachmentsModalOpen(false);
        setSelectedNoteId(null);
        // Refresh notes to update attachment status
        fetchNotes();
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

    const handleRemoveAllFiles = () => {
        setSelectedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Customer Notes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Customer Notes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Customer Notes ({notes.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    All notes for {customerName}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        {notes.length} note{notes.length !== 1 ? 's' : ''}
                    </p>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" onClick={handleAddNew}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Note
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingNote ? 'Edit Note' : 'Add New Note'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Note</label>
                                    <Textarea
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        placeholder="Enter note content..."
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="important"
                                        checked={formData.isImportant}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isImportant: checked as boolean })
                                        }
                                    />
                                    <label htmlFor="important" className="text-sm font-medium">
                                        Mark as important
                                    </label>
                                </div>

                                {/* File Attachments Section */}
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Attachments (Optional)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept="*/*"
                                                onChange={handleFileSelect}
                                                className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Browse
                                            </Button>
                                            {selectedFiles.length > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleRemoveAllFiles}
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Clear All
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Maximum 10 files, 10MB each. You can upload any file type.
                                        </p>
                                    </div>

                                    {/* Selected Files Display */}
                                    {selectedFiles.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Selected Files ({selectedFiles.length}/10)
                                            </label>
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
                                                            type="button"
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
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                        disabled={isUploadingAttachments}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isUploadingAttachments}
                                    >
                                        {isUploadingAttachments ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                {editingNote ? 'Updating...' : 'Adding...'}
                                            </>
                                        ) : (
                                            editingNote ? 'Update' : 'Add'
                                        )} Note
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {notes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                        No notes for this customer yet
                    </p>
                ) : (
                    <div className="space-y-3">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className={`p-4 rounded-lg border overflow-hidden ${note.isImportant
                                    ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20'
                                    : 'border-border bg-background'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
                                    <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm font-medium truncate min-w-0">{note.adminName}</span>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {note.isImportant && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Important
                                                </Badge>
                                            )}
                                            {note.hasAttachments && (
                                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                                    <Paperclip className="h-3 w-3" />
                                                    Has Attachments
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span className="hidden sm:inline">{new Date(note.createdAt).toLocaleDateString()}</span>
                                            <span className="sm:hidden">{new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                            {note.hasAttachments && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleViewAttachments(note.id)}
                                                    title="View Attachments"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(note)}
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(note.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <CollapsibleNote note={note.note} />
                                </div>
                                {note.updatedAt !== note.createdAt && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Updated: {new Date(note.updatedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Attachments Modal */}
            {selectedNoteId && (
                <NoteAttachmentsModal
                    noteId={selectedNoteId}
                    isOpen={attachmentsModalOpen}
                    onOpenChange={handleAttachmentsModalClose}
                    hasAttachments={notes.find(n => n.id === selectedNoteId)?.hasAttachments || false}
                    isAdmin={true}
                />
            )}
        </Card>
    );
} 