"use client";

import { getUserAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export const Owner = ({ id, translations }: { id: string; translations: { loadError: string } }) => {
  const { isLoading, data, error } = useServerActionQuery(getUserAction, {
    input: {
      id: id,
    },
    queryKey: ["getUser", id],
  });

  const LoadingState = () => {
    return (
      <div className="py-10">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  };

  const ErrorState = () => {
    return (
      <div className="py-10 text-muted-foreground">
        {data?.message || translations.loadError}
      </div>
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !data?.success || !data?.user) {
    return <ErrorState />;
  }

  return (
    <div className="py-10 text-primary">
      <Link
        href={`/admin/users/profile/${data.user.id}`}
        className="font-semibold hover:underline"
      >
        {data.user.fullName}
      </Link>
    </div>
  );
};
