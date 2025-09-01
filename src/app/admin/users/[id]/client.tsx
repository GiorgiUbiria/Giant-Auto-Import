"use client";

import { useAtomValue, useAtom } from 'jotai';
import { adminUserLoadingAtom, adminUserErrorAtom, resetAdminUserStateAtom } from '@/lib/admin-user-atoms';
import { UserHeader } from './components/user-header';
import { UserTabs } from './user-tabs';
import { LoadingState } from './components/loading-state';
import { ErrorState } from './components/error-state';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const Client = ({ id }: { id: string }) => {
  const isLoading = useAtomValue(adminUserLoadingAtom);
  const error = useAtomValue(adminUserErrorAtom);
  const [, resetState] = useAtom(resetAdminUserStateAtom);

  const handleRefresh = () => {
    resetState();
    // Force a page reload to reset everything
    window.location.reload();
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Details</h1>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
        <ErrorState message={error} />
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
