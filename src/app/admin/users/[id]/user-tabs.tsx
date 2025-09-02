"use client";

import { useAtom, useAtomValue } from 'jotai';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminUserActiveTabAtom, setAdminUserActiveTabAtom } from '@/lib/simplified-admin-user-atoms';
import { UserOverviewTab } from './tabs/user-overview-tab';
import { UserCarsTab } from './tabs/user-cars-tab';
import { UserPricingTab } from './tabs/user-pricing-tab';
import { UserNotesTab } from './tabs/user-notes-tab';
import { UserProfileTab } from './tabs/user-profile-tab';

export function UserTabs() {
    const activeTab = useAtomValue(adminUserActiveTabAtom);
    const [, setActiveTab] = useAtom(setAdminUserActiveTabAtom);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="cars">Cars</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
                <UserOverviewTab />
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
                <UserProfileTab />
            </TabsContent>

            <TabsContent value="cars" className="mt-6">
                <UserCarsTab />
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
                <UserPricingTab />
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
                <UserNotesTab />
            </TabsContent>
        </Tabs>
    );
}
