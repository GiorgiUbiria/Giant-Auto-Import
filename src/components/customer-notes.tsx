"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, User, Paperclip, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NoteAttachmentsModal } from "./note-attachments-modal";
import { useAtom, useSetAtom } from "jotai";
import { customerNotesAtomFamily, customerNotesWriteAtomFamily, type CustomerNoteAtom } from "@/lib/customer-notes-atoms";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

type CustomerNote = CustomerNoteAtom;

interface CustomerNotesProps {
    userId: string;
    filterImportant?: boolean; // true = only important notes, false = only non-important notes, undefined = all notes
}

export function CustomerNotes({ userId, filterImportant }: CustomerNotesProps) {
    // User component: Shows all notes (both important and regular)
    const [notes, setNotesAtom] = useAtom(customerNotesAtomFamily(userId));
    const writeNotes = useSetAtom(customerNotesWriteAtomFamily(userId));
    const [error, setError] = useState<string | null>(null);
    const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
    const queryClient = useQueryClient();
    const notesQueryKey = ["customer-notes", userId];

    const { data: queryData, isLoading: loading, isError, error: queryError } = useQuery({
        queryKey: notesQueryKey,
        queryFn: async () => {
            const response = await fetch(`/api/customer-notes?customerId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch notes');
            const data = await response.json();
            return data.notes || [];
        },
        enabled: !!userId,
        staleTime: 30_000,
    });

    // Handle successful data fetch
    useEffect(() => {
        if (queryData) {
            setNotesAtom(queryData);
        }
    }, [queryData, setNotesAtom]);

    // Handle errors
    useEffect(() => {
        if (isError && queryError) {
            setError(queryError instanceof Error ? queryError.message : 'Failed to fetch notes');
        }
    }, [isError, queryError]);

    const handleViewAttachments = (noteId: number) => {
        setSelectedNoteId(noteId);
        setAttachmentsModalOpen(true);
    };

    const handleAttachmentsModalClose = () => {
        setAttachmentsModalOpen(false);
        setSelectedNoteId(null);
        // Invalidate to sync attachment flags
        queryClient.invalidateQueries({ queryKey: notesQueryKey });
    };

    if (loading && notes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        All Admin Notes
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

    if (error || isError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        All Admin Notes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {error || (queryError instanceof Error ? queryError.message : 'Failed to fetch notes')}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const allNotes = (notes && notes.length > 0) ? notes : (queryData || []);
    
    // Filter notes based on importance if filterImportant is specified
    const displayNotes = filterImportant !== undefined 
        ? allNotes.filter(note => note.isImportant === filterImportant)
        : allNotes;

    if (displayNotes.length === 0) {
        const getEmptyStateTitle = () => {
            if (filterImportant === true) return "Payment Notes";
            if (filterImportant === false) return "General Notes";
            return "All Admin Notes";
        };
        
        const getEmptyStateMessage = () => {
            if (filterImportant === true) return "No important payment notes available yet";
            if (filterImportant === false) return "No general notes available yet";
            return "No admin notes available yet";
        };

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {getEmptyStateTitle()}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        {getEmptyStateMessage()}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {filterImportant === true ? "Payment Notes" : 
                     filterImportant === false ? "General Notes" : 
                     "All Admin Notes"} ({displayNotes.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {displayNotes.map((note: CustomerNote) => (
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
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span className="hidden sm:inline">{new Date(note.createdAt).toLocaleDateString()}</span>
                                    <span className="sm:hidden">{new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
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
            </CardContent>

            {/* Attachments Modal */}
            {selectedNoteId && (
                <NoteAttachmentsModal
                    noteId={selectedNoteId}
                    isOpen={attachmentsModalOpen}
                    onOpenChange={handleAttachmentsModalClose}
                    hasAttachments={displayNotes.find((n: CustomerNote) => n.id === selectedNoteId)?.hasAttachments || false}
                    isAdmin={false}
                />
            )}
        </Card>
    );
} 