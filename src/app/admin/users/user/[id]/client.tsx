"use client";

import { useAtomValue } from 'jotai';
import { adminUserDataAtom, adminUserCarsAtom } from '@/lib/simplified-admin-user-atoms';
import { UserHeader } from './components/user-header';
import { UserTabs } from './user-tabs';
import { LoadingState } from './components/loading-state';
import { ErrorState } from './components/error-state';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const Client = ({ id }: { id: string }) => {
  const userData = useAtomValue(adminUserDataAtom);
  const carsData = useAtomValue(adminUserCarsAtom);

  const handleRefresh = () => {
    // Force a page reload to reset everything
    window.location.reload();
  };

  // Show loading if data is not yet available (should be rare with server-side fetching)
  if (!userData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Details</h1>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
        <LoadingState />
      </div>
    );
  }

  // Show error if user data is invalid (should be rare with server-side validation)
  if (!userData.id) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Details</h1>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
        <ErrorState message="Invalid user data" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UserHeader />
      <UserTabs />
    </div>
  );
};
