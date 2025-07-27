"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { useServerAction } from "zsa-react";
import { getUserPricingAction, updateUserPricingAction, getDefaultPricingAction } from "@/lib/actions/pricingActions";
import { recalculateUserCarFeesAction } from "@/lib/actions/pricingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, DollarSign, Truck, FileText, Zap, Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface UserPricingFormProps {
  userId: string;
  userName: string;
}

export const UserPricingForm = ({ userId, userName }: UserPricingFormProps) => {
  const t = useTranslations('UserPricing');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [useCustomPricing, setUseCustomPricing] = useState(false);
  const [pricing, setPricing] = useState({
    oceanFee: 1025,
    groundFeeAdjustment: 0,
    pickupSurcharge: 300,
    serviceFee: 100,
    hybridSurcharge: 150,
  });
  const [defaultPricing, setDefaultPricing] = useState({
    oceanFee: 1025,
    groundFeeAdjustment: 0,
    pickupSurcharge: 300,
    serviceFee: 100,
    hybridSurcharge: 150,
  });

  const { execute: getUserPricing } = useServerAction(getUserPricingAction);
  const { execute: updateUserPricing } = useServerAction(updateUserPricingAction);
  const { execute: getDefaultPricing } = useServerAction(getDefaultPricingAction);
  const { execute: recalculateUserFees } = useServerAction(recalculateUserCarFeesAction);

  useEffect(() => {
    loadPricingData();
  }, [userId]);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      
      // Load default pricing
      const [defaultResult, defaultError] = await getDefaultPricing();
      if (defaultError) {
        toast.error("Failed to load default pricing");
        return;
      }
      if (defaultResult.success && defaultResult.data) {
        setDefaultPricing({
          oceanFee: defaultResult.data.oceanFee,
          groundFeeAdjustment: defaultResult.data.groundFeeAdjustment,
          pickupSurcharge: defaultResult.data.pickupSurcharge,
          serviceFee: defaultResult.data.serviceFee,
          hybridSurcharge: defaultResult.data.hybridSurcharge,
        });
      }

      // Load user pricing
      const [userResult, userError] = await getUserPricing({ userId });
      if (userError) {
        toast.error("Failed to load user pricing");
        return;
      }
      if (userResult.success && userResult.data) {
        setPricing({
          oceanFee: userResult.data.oceanFee,
          groundFeeAdjustment: userResult.data.groundFeeAdjustment,
          pickupSurcharge: userResult.data.pickupSurcharge,
          serviceFee: userResult.data.serviceFee,
          hybridSurcharge: userResult.data.hybridSurcharge,
        });
        setUseCustomPricing(userResult.data.isActive);
      } else {
        // No custom pricing, use defaults
        setPricing(defaultPricing);
        setUseCustomPricing(false);
      }
    } catch (error) {
      toast.error("Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only submit if custom pricing is enabled
    if (!useCustomPricing) {
      toast.error("Please enable custom pricing to save changes");
      return;
    }
    
    try {
      setSaving(true);
      const [result, error] = await updateUserPricing({
        userId,
        ...pricing,
      });
      
      if (error) {
        toast.error("Failed to update user pricing");
        return;
      }
      
      if (result.success) {
        toast.success("User pricing updated successfully");
        await loadPricingData(); // Reload to get updated data
      } else {
        toast.error(result.message || "Failed to update user pricing");
      }
    } catch (error) {
      toast.error("Failed to update user pricing");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setPricing(prev => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleUseDefaults = () => {
    setPricing(defaultPricing);
    setUseCustomPricing(false);
  };

  const handleResetToDefaults = () => {
    setPricing(defaultPricing);
  };

  const handleRecalculateUserFees = async () => {
    try {
      const [result, error] = await recalculateUserFees({ userId });
      if (error) {
        toast.error("Failed to recalculate user fees");
        return;
      }
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to recalculate user fees");
      }
    } catch (error) {
      toast.error("Failed to recalculate user fees");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pricing Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Custom pricing for {userName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="custom-pricing"
              checked={useCustomPricing}
              onCheckedChange={setUseCustomPricing}
            />
            <Label htmlFor="custom-pricing">Use Custom Pricing</Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetToDefaults}
            disabled={!useCustomPricing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRecalculateUserFees}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculate User Fees
          </Button>

        </div>
      </div>

      {!useCustomPricing ? (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            This user is using the system default pricing. Enable custom pricing above to set user-specific rates.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              Custom pricing is enabled for this user. These rates will override the system defaults.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ocean Fee */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Ocean Fee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="oceanFee">Savannah → Poti</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="oceanFee"
                      type="number"
                      value={pricing.oceanFee}
                      onChange={(e) => handleInputChange("oceanFee", e.target.value)}
                      className="pl-8"
                      min="0"
                      disabled={!useCustomPricing}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Default:</span>
                    <span className="font-mono">${defaultPricing.oceanFee}</span>
                    {pricing.oceanFee !== defaultPricing.oceanFee && (
                      <Badge variant={pricing.oceanFee > defaultPricing.oceanFee ? "default" : "secondary"}>
                        {pricing.oceanFee > defaultPricing.oceanFee ? "+" : ""}
                        {pricing.oceanFee - defaultPricing.oceanFee}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ground Fee Adjustment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Ground Fee Adjustment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="groundFeeAdjustment">Global Adjustment</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      {pricing.groundFeeAdjustment >= 0 ? "+" : ""}
                    </span>
                    <Input
                      id="groundFeeAdjustment"
                      type="number"
                      value={pricing.groundFeeAdjustment}
                      onChange={(e) => handleInputChange("groundFeeAdjustment", e.target.value)}
                      className="pl-8"
                      disabled={!useCustomPricing}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Default:</span>
                    <span className="font-mono">
                      {defaultPricing.groundFeeAdjustment > 0 ? "+" : ""}{defaultPricing.groundFeeAdjustment}
                    </span>
                    {pricing.groundFeeAdjustment !== defaultPricing.groundFeeAdjustment && (
                      <Badge variant={pricing.groundFeeAdjustment > defaultPricing.groundFeeAdjustment ? "default" : "secondary"}>
                        {pricing.groundFeeAdjustment > defaultPricing.groundFeeAdjustment ? "+" : ""}
                        {pricing.groundFeeAdjustment - defaultPricing.groundFeeAdjustment}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pickup Surcharge */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Pickup Surcharge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="pickupSurcharge">Oversize Surcharge</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="pickupSurcharge"
                      type="number"
                      value={pricing.pickupSurcharge}
                      onChange={(e) => handleInputChange("pickupSurcharge", e.target.value)}
                      className="pl-8"
                      min="0"
                      disabled={!useCustomPricing}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Default:</span>
                    <span className="font-mono">${defaultPricing.pickupSurcharge}</span>
                    {pricing.pickupSurcharge !== defaultPricing.pickupSurcharge && (
                      <Badge variant={pricing.pickupSurcharge > defaultPricing.pickupSurcharge ? "default" : "secondary"}>
                        {pricing.pickupSurcharge > defaultPricing.pickupSurcharge ? "+" : ""}
                        {pricing.pickupSurcharge - defaultPricing.pickupSurcharge}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Fee */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Service Fee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="serviceFee">Documentation Fee</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="serviceFee"
                      type="number"
                      value={pricing.serviceFee}
                      onChange={(e) => handleInputChange("serviceFee", e.target.value)}
                      className="pl-8"
                      min="0"
                      disabled={!useCustomPricing}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Default:</span>
                    <span className="font-mono">${defaultPricing.serviceFee}</span>
                    {pricing.serviceFee !== defaultPricing.serviceFee && (
                      <Badge variant={pricing.serviceFee > defaultPricing.serviceFee ? "default" : "secondary"}>
                        {pricing.serviceFee > defaultPricing.serviceFee ? "+" : ""}
                        {pricing.serviceFee - defaultPricing.serviceFee}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hybrid Surcharge */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Hybrid Surcharge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="hybridSurcharge">Electric/Hybrid</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="hybridSurcharge"
                      type="number"
                      value={pricing.hybridSurcharge}
                      onChange={(e) => handleInputChange("hybridSurcharge", e.target.value)}
                      className="pl-8"
                      min="0"
                      disabled={!useCustomPricing}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Default:</span>
                    <span className="font-mono">${defaultPricing.hybridSurcharge}</span>
                    {pricing.hybridSurcharge !== defaultPricing.hybridSurcharge && (
                      <Badge variant={pricing.hybridSurcharge > defaultPricing.hybridSurcharge ? "default" : "secondary"}>
                        {pricing.hybridSurcharge > defaultPricing.hybridSurcharge ? "+" : ""}
                        {pricing.hybridSurcharge - defaultPricing.hybridSurcharge}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !useCustomPricing}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save User Pricing
            </Button>
          </div>
        </>
      )}
    </form>
  );
}; 