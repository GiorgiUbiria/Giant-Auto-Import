"use client";

import React, { useState, useRef } from "react";
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
import { useAtom, useSetAtom } from "jotai";
import { customerNotesAtomFamily, customerNotesWriteAtomFamily, type CustomerNoteAtom, type CustomerNotesAction } from "@/lib/customer-notes-atoms";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden text-gray-800 dark:text-gray-200">
                    {note}
                </p>
            </div>
        );
    }

    return (
        <div className="min-w-0 space-y-2">
            <div className="overflow-hidden">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">
                    {isExpanded ? note : `${note.slice(0, maxLength)}...`}
                </p>
            </div>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-auto p-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 self-start transition-colors"
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

type CustomerNote = CustomerNoteAtom;

interface AdminCustomerNotesProps {
    customerId: string;
    customerName: string;
}

export function AdminCustomerNotes({ customerId, customerName }: AdminCustomerNotesProps) {
    // Admin component: Shows all notes for comprehensive management
    const [notes, setNotesAtom] = useAtom(customerNotesAtomFamily(customerId));
    const writeNotes = useSetAtom(customerNotesWriteAtomFamily(customerId));
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

    const queryClient = useQueryClient();
    const notesQueryKey = ["customer-notes", customerId];

    const { data: queryData, isLoading: isNotesLoading, isError, error: queryError } = useQuery({
        queryKey: notesQueryKey,
        queryFn: async () => {
            const response = await fetch(`/api/customer-notes?customerId=${customerId}`);
            if (!response.ok) throw new Error('Failed to fetch notes');
            const data = await response.json();
            return data.notes || [];
        },
        enabled: !!customerId,
        staleTime: 30_000,
    });

    // Handle successful data fetch
    React.useEffect(() => {
        if (queryData) {
            setNotesAtom(queryData);
        }
    }, [queryData, setNotesAtom]);

    // Handle errors
    React.useEffect(() => {
        if (isError && queryError) {
            setError(queryError instanceof Error ? queryError.message : 'Failed to fetch notes');
        }
    }, [isError, queryError]);

    const saveNoteMutation = useMutation({
        mutationFn: async () => {
            const url = `/api/customer-notes`;
            const method = editingNote ? 'PUT' : 'POST';
            const body = editingNote
                ? { id: editingNote.id, ...formData }
                : { customerId, ...formData };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) throw new Error('Failed to save note');
            const result = await response.json();
            const savedNote: CustomerNote = result.note;

            // If attachments are selected, upload and wait
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
                        noteId: savedNote.id,
                        files: filesData,
                    });
                    if (uploadError) throw uploadError;
                } finally {
                    setIsUploadingAttachments(false);
                }
            }

            return savedNote;
        },
        onSuccess: async (savedNote) => {
            // Optimistically update atom
            if (editingNote) {
                writeNotes({ type: 'update', note: savedNote });
            } else {
                writeNotes({ type: 'add', note: savedNote });
            }
            // Refetch from server to hydrate adminName and attachment flags
            await queryClient.invalidateQueries({ queryKey: notesQueryKey });

            toast.success(editingNote ? 'Note updated successfully' : 'Note added successfully');

            setIsDialogOpen(false);
            setEditingNote(null);
            setFormData({ note: "", isImportant: false });
            setSelectedFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (err: unknown) => {
            toast.error(err instanceof Error ? err.message : 'Failed to save note');
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        saveNoteMutation.mutate();
    };

    const handleDelete = async (noteId: number) => {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            const response = await fetch(`/api/customer-notes?id=${noteId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete note');
            // Remove from atom immediately and refetch to confirm
            writeNotes({ type: 'delete', id: noteId });
            await queryClient.invalidateQueries({ queryKey: notesQueryKey });
            toast.success('Note deleted successfully');
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
        // Invalidate to sync flags
        queryClient.invalidateQueries({ queryKey: notesQueryKey });
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

    // Determine which notes to display
    const displayNotes: CustomerNote[] = (notes && notes.length > 0) ? notes : (queryData || []);

    if (isNotesLoading && notes.length === 0) {
        return (
            <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                    <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Customer Notes
                    </CardTitle>
                </CardHeader>
                <CardContent className="bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || isError) {
        return (
            <Card className="border-red-200 dark:border-red-800">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                    <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                        <MessageSquare className="h-5 w-5 text-red-600 dark:text-red-400" />
                        Customer Notes
                    </CardTitle>
                </CardHeader>
                <CardContent className="bg-white dark:bg-gray-900">
                    <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-900/20">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                            {error || (queryError instanceof Error ? queryError.message : 'Failed to fetch notes')}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Customer Notes ({displayNotes.length})
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    All notes for {customerName}
                </p>
            </CardHeader>
            <CardContent className="space-y-4 bg-white dark:bg-gray-900 p-6">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {displayNotes.length} note{displayNotes.length !== 1 ? 's' : ''}
                    </p>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                onClick={handleAddNew}
                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Note
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-gray-800 dark:text-gray-200">
                                    {editingNote ? 'Edit Note' : 'Add New Note'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Note</label>
                                    <Textarea
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        placeholder="Enter note content..."
                                        rows={4}
                                        required
                                        className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="important"
                                        checked={formData.isImportant}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isImportant: checked as boolean })
                                        }
                                        className="text-blue-600 border-gray-300 dark:border-gray-600"
                                    />
                                    <label htmlFor="important" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Mark as important
                                    </label>
                                </div>

                                {/* File Attachments Section */}
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Attachments (Optional)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept="*/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex-1"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Browse Files
                                            </Button>
                                            {selectedFiles.length > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleRemoveAllFiles}
                                                    className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Clear All
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Maximum 10 files, 10MB each. You can upload any file type.
                                        </p>
                                    </div>

                                    {/* Selected Files Display */}
                                    {selectedFiles.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Selected Files ({selectedFiles.length}/10)
                                            </label>
                                            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                                                {selectedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                                        <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">{file.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
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
                                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                        disabled={isUploadingAttachments}
                                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isUploadingAttachments}
                                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
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

                {displayNotes.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                            No notes for this customer yet
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            Start by adding the first note above
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayNotes.map((note) => (
                            <div
                                key={note.id}
                                className={`p-5 rounded-lg border overflow-hidden transition-all duration-200 hover:shadow-md ${note.isImportant
                                    ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 dark:border-orange-700 dark:from-orange-950/30 dark:to-amber-950/30'
                                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-3 min-w-0">
                                    <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-sm font-medium truncate min-w-0 text-gray-800 dark:text-gray-200">
                                            {note.adminName || 'Unknown Admin'}
                                        </span>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {note.isImportant && (
                                                <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-700">
                                                    Important
                                                </Badge>
                                            )}
                                            {note.hasAttachments && (
                                                <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                                                    <Paperclip className="h-3 w-3" />
                                                    Has Attachments
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            <span className="hidden sm:inline">{new Date(note.createdAt).toLocaleDateString()}</span>
                                            <span className="sm:hidden">{new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1 ml-3">
                                            {note.hasAttachments && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleViewAttachments(note.id)}
                                                    title="View Attachments"
                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(note)}
                                                className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(note.id)}
                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
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
                    hasAttachments={displayNotes.find(n => n.id === selectedNoteId)?.hasAttachments || false}
                    isAdmin={true}
                />
            )}
        </Card>
    );
} 