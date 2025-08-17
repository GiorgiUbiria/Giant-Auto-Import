"use client";

import { useAtomValue } from 'jotai';
import { adminUserDataAtom } from '@/lib/admin-user-atoms';
import { AdminCustomerNotes } from '@/components/admin-customer-notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Info, AlertTriangle } from 'lucide-react';

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
          <span className="text-sm text-muted-foreground">Important Notes Only</span>
        </div>
      </div>

      {/* Information Card */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <Info className="h-5 w-5" />
            About Customer Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
            <p>
              This tab shows only <strong>important notes</strong> for <strong>{user.fullName}</strong>.
            </p>
            <p>
              Regular notes are hidden here to help you focus on critical information. Users can see all notes on their dashboard.
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

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Note Management Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Mark notes as important only for critical information that requires immediate attention</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Use clear, concise language and include relevant dates and action items</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Regular notes are perfect for general communication and follow-ups</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Review and clean up old notes periodically to maintain relevance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
