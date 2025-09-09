"use client";

import { useEffect, useCallback } from "react";
import { useTranslations } from 'next-intl';
import { useServerAction } from "zsa-react";
import { useAtom, useAtomValue } from 'jotai';
import { getUsersAction } from "@/lib/actions/userActions";
import { getUserPricingAction } from "@/lib/actions/pricingActions";
import {
  usersAtom,
  userPricingAtom,
  userSearchTermAtom,
  userLoadingAtom,
  filteredUsersAtom,
  pricingStatusAtom,
  formatOceanRatesAtom,
  getOceanRatesTooltipAtom,
  setUsersAtom,
  setUserPricingAtom,
  setUserSearchTermAtom,
  setUserLoadingAtom,
  OceanRate,
} from '@/lib/pricing-atoms';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Loader2,
  Search,
  Settings,
  User,
  DollarSign,
  Users,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export const UserPricingList = () => {
  const t = useTranslations('PricingManagement');

  // Jotai atoms
  const users = useAtomValue(usersAtom);
  const userPricing = useAtomValue(userPricingAtom);
  const searchTerm = useAtomValue(userSearchTermAtom);
  const loading = useAtomValue(userLoadingAtom);
  const filteredUsers = useAtomValue(filteredUsersAtom);
  const getPricingStatus = useAtomValue(pricingStatusAtom);
  const formatOceanRates = useAtomValue(formatOceanRatesAtom);
  const getOceanRatesTooltip = useAtomValue(getOceanRatesTooltipAtom);

  // Action atoms
  const [, setUsers] = useAtom(setUsersAtom);
  const [, setUserPricing] = useAtom(setUserPricingAtom);
  const [, setSearchTerm] = useAtom(setUserSearchTermAtom);
  const [, setLoading] = useAtom(setUserLoadingAtom);

  const { execute: getUsers } = useServerAction(getUsersAction);
  const { execute: getUserPricing } = useServerAction(getUserPricingAction);

  const loadUserPricing = useCallback(async (userList: any[]) => {
    const pricingData: Record<string, any> = {};

    for (const user of userList) {
      try {
        const [result, error] = await getUserPricing({ userId: user.id });
        if (error) {
          console.error(`Failed to load pricing for user ${user.id}:`, error);
          continue;
        }
        if (result.success && result.data) {
          pricingData[user.id] = result.data;
        }
      } catch (error) {
        console.error(`Failed to load pricing for user ${user.id}:`, error);
      }
    }

    setUserPricing(pricingData);
  }, [getUserPricing, setUserPricing]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [result, error] = await getUsers();
      if (error) {
        toast.error("Failed to load users");
        return;
      }
      setUsers(result || []);
      // Load pricing for each user
      await loadUserPricing(result || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [getUsers, setUsers, loadUserPricing, setLoading]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const getPricingStatusBadge = (status: string) => {
    switch (status) {
      case "custom":
        return <Badge className="bg-green-100 text-green-800">Custom</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Default</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold truncate">User Pricing Configurations</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {users.length} total users, {Object.keys(userPricing).filter(id => userPricing[id]?.isActive).length} with custom pricing
          </p>
        </div>
        <div className="relative flex-shrink-0 w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 sm:pl-10 w-full text-sm"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            {searchTerm ? "No users found matching your search." : "No users found."}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="block lg:hidden space-y-3 sm:space-y-4 w-full">
            {filteredUsers.map((user) => {
              const pricing = userPricing[user.id];
              const status = getPricingStatus(user.id);

              return (
                <Card key={user.id} className="p-3 sm:p-4 w-full">
                  <div className="space-y-3 w-full">
                    {/* User Info */}
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{user.fullName}</h4>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs flex-shrink-0">{user.role}</Badge>
                          {getPricingStatusBadge(status)}
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline" className="text-xs flex-shrink-0">
                        <Link href={`/admin/users/${user.id}`}>
                          <Settings className="h-3 w-3 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    </div>

                    {/* Pricing Details Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 border-t w-full">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Ocean Rates</p>
                        <div className="flex items-center gap-1 min-w-0" title={getOceanRatesTooltip(pricing?.oceanRates)}>
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-mono text-xs truncate">
                            {formatOceanRates(pricing?.oceanRates)}
                          </span>
                          {pricing?.oceanRates && pricing.oceanRates.length > 1 && (
                            <Badge variant="outline" className="ml-1 text-xs flex-shrink-0">
                              {pricing.oceanRates.length}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Ground Adj.</p>
                        <span className={`font-mono text-xs block truncate ${pricing?.groundFeeAdjustment > 0 ? 'text-green-600' : pricing?.groundFeeAdjustment < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {pricing?.groundFeeAdjustment ? (pricing.groundFeeAdjustment > 0 ? '+' : '') + pricing.groundFeeAdjustment : "Default"}
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Pickup</p>
                        <div className="flex items-center gap-1 min-w-0">
                          <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-mono text-xs truncate">
                            {pricing?.pickupSurcharge || "Default"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Service</p>
                        <div className="flex items-center gap-1 min-w-0">
                          <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-mono text-xs truncate">
                            {pricing?.serviceFee || "Default"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 col-span-2 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Hybrid Surcharge</p>
                        <div className="flex items-center gap-1 min-w-0">
                          <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-mono text-xs truncate">
                            {pricing?.hybridSurcharge || "Default"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden lg:block w-full">
            <div className="rounded-md border overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">User</TableHead>
                    <TableHead className="w-20">Role</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="min-w-[120px]">Ocean Rates</TableHead>
                    <TableHead className="w-20">Ground</TableHead>
                    <TableHead className="w-20">Pickup</TableHead>
                    <TableHead className="w-20">Service</TableHead>
                    <TableHead className="w-20">Hybrid</TableHead>
                    <TableHead className="text-right w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const pricing = userPricing[user.id];
                    const status = getPricingStatus(user.id);

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-sm truncate">{user.fullName}</span>
                              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {getPricingStatusBadge(status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" title={getOceanRatesTooltip(pricing?.oceanRates)}>
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="font-mono text-sm truncate">
                              {formatOceanRates(pricing?.oceanRates)}
                            </span>
                            {pricing?.oceanRates && pricing.oceanRates.length > 1 && (
                              <Badge variant="outline" className="ml-1 text-xs flex-shrink-0">
                                {pricing.oceanRates.length}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-mono text-sm ${pricing?.groundFeeAdjustment > 0 ? 'text-green-600' : pricing?.groundFeeAdjustment < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {pricing?.groundFeeAdjustment ? (pricing.groundFeeAdjustment > 0 ? '+' : '') + pricing.groundFeeAdjustment : "Default"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="font-mono text-sm">
                              {pricing?.pickupSurcharge || "Default"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="font-mono text-sm">
                              {pricing?.serviceFee || "Default"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="font-mono text-sm">
                              {pricing?.hybridSurcharge || "Default"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/users/${user.id}`}>
                              <Settings className="h-3 w-3 mr-1" />
                              Configure
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      <div className="text-sm text-muted-foreground">
        <p>• <strong>Default:</strong> Uses system-wide default pricing</p>
        <p>• <strong>Custom:</strong> Has user-specific pricing configuration</p>
        <p>• <strong>Inactive:</strong> Custom pricing exists but is disabled</p>
        <p>• <strong>Ocean Rates:</strong> Shows configured rates or &quot;Default&quot; if using system rates</p>
        <p>• Click &quot;Configure&quot; to set up custom pricing for a user</p>
      </div>
    </div>
  );
}; 