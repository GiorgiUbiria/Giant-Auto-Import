"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { DefaultPricingForm } from "./default-pricing-form";
import { UserPricingList } from "./user-pricing-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, TrendingUp } from "lucide-react";

export const PricingManagementClient = () => {
  const t = useTranslations('PricingManagement');
  const [activeTab, setActiveTab] = useState("default");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Pricing</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">System-wide</div>
            <p className="text-xs text-muted-foreground">
              Base pricing for all users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Overrides</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Custom</div>
            <p className="text-xs text-muted-foreground">
              Individual user pricing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CSV Data</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dynamic</div>
            <p className="text-xs text-muted-foreground">
              Ground fee rates from CSV
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="default" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Default Pricing
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Pricing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="default" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Pricing Configuration</CardTitle>
              <CardDescription>
                Set the default pricing that applies to all users unless they have custom pricing configured.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DefaultPricingForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User-Specific Pricing</CardTitle>
              <CardDescription>
                Manage custom pricing configurations for individual users. These override the default pricing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserPricingList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 