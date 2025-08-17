"use client";

import { useAtomValue } from 'jotai';
import { adminUserDataAtom, adminUserCarsAtom } from '@/lib/admin-user-atoms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Car, Calendar, Mail, Phone, DollarSign } from 'lucide-react';

export function UserOverviewTab() {
  const user = useAtomValue(adminUserDataAtom);
  const cars = useAtomValue(adminUserCarsAtom);

  if (!user) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        User data not available
      </div>
    );
  }

  const totalCars = cars.length;
  const activeCars = cars.filter(car => car.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Overview</h2>
        <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'default'}>
          {user.role}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Information</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm text-muted-foreground">{user.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm text-muted-foreground">{user.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Phone:</span>
                <span className="text-sm text-muted-foreground">{user.phone || 'Not provided'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cars Summary Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cars Summary</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Total Cars:</span>
                <span className="text-sm text-muted-foreground">{totalCars}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Active Cars:</span>
                <span className="text-sm text-muted-foreground">{activeCars}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Inactive:</span>
                <span className="text-sm text-muted-foreground">{totalCars - activeCars}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Balance:</span>
                <span className="text-sm text-muted-foreground">
                  ${user.balance ? user.balance.toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={user.balance && user.balance > 0 ? 'destructive' : 'default'}>
                  {user.balance && user.balance > 0 ? 'Outstanding Balance' : 'Good Standing'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <Car className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">View All Cars</p>
                <p className="text-sm text-muted-foreground">Browse user&apos;s vehicle inventory</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Manage Pricing</p>
                <p className="text-sm text-muted-foreground">Set custom rates for this user</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Edit Profile</p>
                <p className="text-sm text-muted-foreground">Update user information</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
