"use client";

import { useAtomValue } from 'jotai';
import { adminUserDataAtom } from '@/lib/simplified-admin-user-atoms';
import { AdminCustomerNotes } from '@/components/admin-customer-notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export function UserNotesTab() {
  const user = useAtomValue(adminUserDataAtom);

  if (!user) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        User data not available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Notes</h2>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">All Notes</span>
        </div>
      </div>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            Notes for {user.fullName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <p>
              This tab shows <strong>all notes</strong> for <strong>{user.fullName}</strong>, including both important and regular notes.
            </p>
            <p>
              Admins can view, create, edit, and manage all customer notes from this interface.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notes Component */}
      <Card>
        <CardContent className="p-6">
          <AdminCustomerNotes
            customerId={user.id}
            customerName={user.fullName}
          />
        </CardContent>
      </Card>
    </div>
  );
}
