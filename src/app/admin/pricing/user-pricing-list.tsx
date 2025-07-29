"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { useServerAction } from "zsa-react";
import { getUsersAction } from "@/lib/actions/userActions";
import { getUserPricingAction } from "@/lib/actions/pricingActions";
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

interface OceanRate {
  state: string;
  shorthand: string;
  rate: number;
}

export const UserPricingList = () => {
  const t = useTranslations('PricingManagement');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userPricing, setUserPricing] = useState<Record<string, any>>({});

  const { execute: getUsers } = useServerAction(getUsersAction);
  const { execute: getUserPricing } = useServerAction(getUserPricingAction);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
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
  };

  const loadUserPricing = async (userList: any[]) => {
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
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPricingStatus = (userId: string) => {
    const pricing = userPricing[userId];
    if (!pricing) return "default";
    if (!pricing.isActive) return "inactive";
    return "custom";
  };

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

  const formatOceanRates = (oceanRates: OceanRate[] | null | undefined) => {
    if (!oceanRates || oceanRates.length === 0) {
      return "Default";
    }
    
    if (oceanRates.length === 1) {
      return `${oceanRates[0].shorthand}: $${oceanRates[0].rate}`;
    }
    
    return `${oceanRates.length} rates configured`;
  };

  const getOceanRatesTooltip = (oceanRates: OceanRate[] | null | undefined) => {
    if (!oceanRates || oceanRates.length === 0) {
      return "Using system default ocean rates";
    }
    
    return oceanRates.map(rate => `${rate.state}: $${rate.rate}`).join('\n');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">User Pricing Configurations</h3>
          <p className="text-sm text-muted-foreground">
            {users.length} total users, {Object.keys(userPricing).filter(id => userPricing[id]?.isActive).length} with custom pricing
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Pricing Status</TableHead>
                <TableHead>Ocean Rates</TableHead>
                <TableHead>Ground Adjustment</TableHead>
                <TableHead>Pickup Surcharge</TableHead>
                <TableHead>Service Fee</TableHead>
                <TableHead>Hybrid Surcharge</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                        <div className="flex flex-col">
                          <span className="font-medium">{user.fullName}</span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {getPricingStatusBadge(status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1" title={getOceanRatesTooltip(pricing?.oceanRates)}>
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {formatOceanRates(pricing?.oceanRates)}
                        </span>
                        {pricing?.oceanRates && pricing.oceanRates.length > 1 && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            {pricing.oceanRates.length}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono ${pricing?.groundFeeAdjustment > 0 ? 'text-green-600' : pricing?.groundFeeAdjustment < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {pricing?.groundFeeAdjustment ? (pricing.groundFeeAdjustment > 0 ? '+' : '') + pricing.groundFeeAdjustment : "Default"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono">
                          {pricing?.pickupSurcharge || "Default"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono">
                          {pricing?.serviceFee || "Default"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono">
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
      )}

      <div className="text-sm text-muted-foreground">
        <p>• <strong>Default:</strong> Uses system-wide default pricing</p>
        <p>• <strong>Custom:</strong> Has user-specific pricing configuration</p>
        <p>• <strong>Inactive:</strong> Custom pricing exists but is disabled</p>
        <p>• <strong>Ocean Rates:</strong> Shows configured rates or "Default" if using system rates</p>
        <p>• Click &quot;Configure&quot; to set up custom pricing for a user</p>
      </div>
    </div>
  );
}; 