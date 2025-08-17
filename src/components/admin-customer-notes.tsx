"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, User, Plus, Edit, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface CustomerNote {
    id: number;
    note: string;
    isImportant: boolean;
    createdAt: string;
    updatedAt: string;
    adminName: string;
}

interface AdminCustomerNotesProps {
    customerId: string;
    customerName: string;
}

export function AdminCustomerNotes({ customerId, customerName }: AdminCustomerNotesProps) {
    // Admin component: Only shows important notes for quick reference
    const [notes, setNotes] = useState<CustomerNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<CustomerNote | null>(null);
    const [formData, setFormData] = useState({
        note: "",
        isImportant: false,
    });

    const fetchNotes = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/customer-notes?customerId=${customerId}&importantOnly=true`);

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

            toast.success(editingNote ? 'Note updated successfully' : 'Note added successfully');
            setIsDialogOpen(false);
            setEditingNote(null);
            setFormData({ note: "", isImportant: false });
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
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingNote(null);
        setFormData({ note: "", isImportant: false });
        setIsDialogOpen(true);
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
                    Important Notes ({notes.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Important notes for {customerName}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        {notes.length} important note{notes.length !== 1 ? 's' : ''}
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
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {editingNote ? 'Update' : 'Add'} Note
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {notes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                        No important notes for this customer yet
                    </p>
                ) : (
                    <div className="space-y-3">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className={`p-4 rounded-lg border ${note.isImportant
                                    ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20'
                                    : 'border-border bg-background'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{note.adminName}</span>
                                        {note.isImportant && (
                                            <Badge variant="destructive" className="text-xs">
                                                Important
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
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
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {note.note}
                                </p>
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
        </Card>
    );
} 