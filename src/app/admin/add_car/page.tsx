'use client';

import { AddCarForm } from "@/components/add-car-form";
import ErrorBoundary from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authorization on client side to avoid SSR issues
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.role === 'ADMIN') {
            setIsAuthorized(true);
          } else {
            router.push('/');
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="w-full grid place-items-center mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect via useEffect
  }

  return (
    <ErrorBoundary>
      <div className="w-full grid place-items-center mt-8">
        <h1 className="text-3xl text-primary my-4">Add Car</h1>
        <AddCarForm />
      </div>
    </ErrorBoundary>
  );
}
