"use client";

import { useTranslations } from 'next-intl';
import { useAtom, useAtomValue } from 'jotai';
import { DefaultPricingForm } from "./default-pricing-form";
import { UserPricingList } from "./user-pricing-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, TrendingUp } from "lucide-react";
import { activeTabAtom, setActiveTabAtom } from '@/lib/pricing-atoms';

export const PricingManagementClient = () => {
  const t = useTranslations('PricingManagement');

  // Jotai atoms
  const activeTab = useAtomValue(activeTabAtom);
  const [, setActiveTab] = useAtom(setActiveTabAtom);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t("defaultPricing")}</CardTitle>
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">System-wide</div>
            <p className="text-xs text-muted-foreground">
              Base pricing for all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t("userPricing")}</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">Custom</div>
            <p className="text-xs text-muted-foreground">
              Individual user pricing
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">CSV Data</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">Dynamic</div>
            <p className="text-xs text-muted-foreground">
              Ground fee rates from CSV
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="default" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">{t("defaultPricing")}</span>
            <span className="xs:hidden">Default</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">{t("userPricing")}</span>
            <span className="xs:hidden">Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="default" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("defaultPricing")} Configuration</CardTitle>
              <CardDescription>
                Set the default pricing that applies to all users unless they have custom pricing configured.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DefaultPricingForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 sm:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">User-Specific {t("pricing")}</CardTitle>
              <CardDescription className="text-sm">
                Manage custom pricing configurations for individual users. These override the default pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="px-4 sm:px-0">
                <UserPricingList />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 