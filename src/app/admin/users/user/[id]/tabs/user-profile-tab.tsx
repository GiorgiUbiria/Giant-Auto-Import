"use client";

import { useAtomValue } from 'jotai';
import { adminUserDataAtom } from '@/lib/simplified-admin-user-atoms';
import { UpdateProfileForm } from '../edit-profile-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function UserProfileTab() {
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
        <h2 className="text-2xl font-bold">User Profile</h2>
        <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'default'}>
          {user.role}
        </Badge>
      </div>

      {/* Current Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">{user.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email || 'Not provided'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
