"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CustomerNote {
    id: number;
    note: string;
    isImportant: boolean;
    createdAt: string;
    updatedAt: string;
    adminName: string;
}

interface CustomerNotesProps {
    userId: string;
}

export function CustomerNotes({ userId }: CustomerNotesProps) {
    // User component: Shows all notes (both important and regular)
    const [notes, setNotes] = useState<CustomerNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setLoading(true);
                // Users see all their notes (no filtering by importance)
                const response = await fetch(`/api/customer-notes?customerId=${userId}`);

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
        };

        fetchNotes();
    }, [userId]);

    if (loading) {
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

    if (error) {
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
                            {error}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (notes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        All Admin Notes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        No admin notes available yet
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
                    All Admin Notes ({notes.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(note.createdAt).toLocaleDateString()}
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
            </CardContent>
        </Card>
    );
} 