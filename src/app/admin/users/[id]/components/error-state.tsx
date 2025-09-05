"use client";

import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  showBackButton?: boolean;
}

export function ErrorState({ message, onRetry, showBackButton = true }: ErrorStateProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading User Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load user information</AlertTitle>
            <AlertDescription className="mt-2">
              {message || "An unexpected error occurred while trying to load the user's data. Please try again."}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            
            {showBackButton && (
              <Link href="/admin/users">
                <Button variant="secondary" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Users
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Troubleshooting Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check if the user ID is valid and exists in the system</li>
              <li>• Verify you have the necessary permissions to view this user</li>
              <li>• Try refreshing the page or navigating back and forth</li>
              <li>• Contact system administrator if the problem persists</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TabErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
        <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load tab content</AlertTitle>
            <AlertDescription className="mt-2">
              {message || "An error occurred while loading this tab's content."}
            </AlertDescription>
          </Alert>
          
          {onRetry && (
            <div className="mt-4">
              <Button onClick={onRetry} variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
