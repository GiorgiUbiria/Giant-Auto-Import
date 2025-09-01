"use client";

import { useAtomValue } from 'jotai';
import { adminUserDataAtom } from '@/lib/admin-user-atoms';
import { UserPricingForm } from '../pricing-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Settings, Info } from 'lucide-react';

export function UserPricingTab() {
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
        <h2 className="text-2xl font-bold">User Pricing Configuration</h2>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Custom Rates</span>
        </div>
      </div>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Info className="h-5 w-5" />
            About User-Specific Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <p>
              Set custom pricing rates for <strong>{user.fullName}</strong> that will override the default system pricing.
            </p>
            <p>
              These rates will apply to all new transactions for this user. Existing transactions will not be affected.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Pricing Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserPricingForm 
            userId={user.id} 
            userName={user.fullName} 
          />
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Rules & Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>User-specific rates take precedence over default system pricing</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>Changes apply immediately to new transactions</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>You can reset to default pricing at any time</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>Pricing history is maintained for audit purposes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
