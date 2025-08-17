"use client";

import { useAtomValue } from 'jotai';
import { adminUserLoadingAtom, adminUserErrorAtom } from '@/lib/admin-user-atoms';
import { UserHeader } from './components/user-header';
import { UserTabs } from './user-tabs';
import { LoadingState } from './components/loading-state';
import { ErrorState } from './components/error-state';

export const Client = ({ id }: { id: string }) => {
  const isLoading = useAtomValue(adminUserLoadingAtom);
  const error = useAtomValue(adminUserErrorAtom);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-8">
      <UserHeader />
      <UserTabs />
    </div>
  );
};
