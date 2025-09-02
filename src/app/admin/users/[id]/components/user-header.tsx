"use client";

import { useAtomValue } from 'jotai';
import { adminUserDataAtom } from '@/lib/simplified-admin-user-atoms';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function UserHeader() {
  const user = useAtomValue(adminUserDataAtom);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user.fullName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'default'}>
                <Shield className="h-3 w-3 mr-1" />
                {user.role}
              </Badge>
              <span className="text-sm text-muted-foreground">
                User ID: {user.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Quick Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {user.email || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  {user.phone || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Account Status</p>
                <p className="text-sm text-muted-foreground">
                  Active
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
