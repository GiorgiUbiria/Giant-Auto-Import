"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from 'next-intl';
import { useServerAction } from "zsa-react";
import { updateUserPricingAction } from "@/lib/actions/pricingActions";
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
    oceanRates: [] as Array<{ state: string, shorthand: string, rate: number }>,
    groundFeeAdjustment: 0,
    pickupSurcharge: 300,
    serviceFee: 100,
    hybridSurcharge: 150,
  });
  const [defaultPricing, setDefaultPricing] = useState({
    oceanRates: [] as Array<{ state: string, shorthand: string, rate: number }>,
    groundFeeAdjustment: 0,
    pickupSurcharge: 300,
    serviceFee: 100,
    hybridSurcharge: 150,
  });
  const [baseOceanRates, setBaseOceanRates] = useState<Array<{ state: string, shorthand: string, rate: number }>>([]);

  // Handle numeric input focus to clear the field when starting to type
  const handleNumericInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    if (input.value === "0") {
      input.value = "";
    }
  };

  // Handle numeric input change to handle empty values properly
  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: number) => void) => {
    const value = e.target.value;
    if (value === "" || value === "0") {
      setter(0);
    } else {
      setter(parseInt(value) || 0);
    }
  };

  const { execute: updateUserPricing } = useServerAction(updateUserPricingAction);
  const { execute: recalculateUserFees } = useServerAction(recalculateUserCarFeesAction);

  const loadPricingData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const userPricingRes = await fetch(`/api/pricing/user/${encodeURIComponent(userId)}`, { cache: 'no-store' });
      const userPricingResult = userPricingRes.ok ? await userPricingRes.json() : null;
      const defaultPricingRes = await fetch(`/api/pricing/default`, { cache: 'no-store' });
      const defaultPricingResult = defaultPricingRes.ok ? await defaultPricingRes.json() : null;
      const oceanRatesRes = await fetch(`/api/pricing/ocean`, { cache: 'no-store' });
      const oceanRatesJson = oceanRatesRes.ok ? await oceanRatesRes.json() : { data: [] };

      if (userPricingResult) {
        const userData = userPricingResult;
        setPricing({
          oceanRates: Array.isArray(userData.oceanRates) ? userData.oceanRates as Array<{ state: string; shorthand: string; rate: number }> : [],
          groundFeeAdjustment: userData.groundFeeAdjustment,
          pickupSurcharge: userData.pickupSurcharge,
          serviceFee: userData.serviceFee,
          hybridSurcharge: userData.hybridSurcharge,
        });
        setUseCustomPricing(userData.isActive);
      } else {
        const defaultData = defaultPricingResult;
        if (defaultData) {
          setPricing({
            oceanRates: Array.isArray(defaultData.oceanRates) ? defaultData.oceanRates as Array<{ state: string; shorthand: string; rate: number }> : [],
            groundFeeAdjustment: defaultData.groundFeeAdjustment,
            pickupSurcharge: defaultData.pickupSurcharge,
            serviceFee: defaultData.serviceFee,
            hybridSurcharge: defaultData.hybridSurcharge,
          });
        }
        setUseCustomPricing(false);
      }

      setBaseOceanRates(Array.isArray(oceanRatesJson.data) ? oceanRatesJson.data : []);
    } catch (error) {
      toast.error("Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPricingData();
  }, [loadPricingData]);

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
        isActive: useCustomPricing,
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

  // Merge helper: ensure each default shorthand exists in userRates; keep user override when present
  const mergeOceanRates = (
    defaultRates: Array<{ state: string, shorthand: string, rate: number }>,
    userRates: Array<{ state: string, shorthand: string, rate: number }>
  ): Array<{ state: string, shorthand: string, rate: number }> => {
    const byShort: Record<string, { state: string, shorthand: string, rate: number }> = {};
    userRates.forEach(r => {
      const key = (r.shorthand || '').toString().trim().toUpperCase();
      byShort[key] = { ...r, shorthand: key };
    });
    const result: Array<{ state: string, shorthand: string, rate: number }> = [];
    defaultRates.forEach(d => {
      const key = (d.shorthand || '').toString().trim().toUpperCase();
      if (byShort[key]) {
        // preserve user override but normalize shorthand casing
        result.push({ ...byShort[key], shorthand: key, state: byShort[key].state || d.state });
      } else {
        result.push({ state: d.state, shorthand: key, rate: d.rate });
      }
    });
    // include any extra user-defined ports that are not in defaults
    userRates.forEach(u => {
      const key = (u.shorthand || '').toString().trim().toUpperCase();
      if (!result.find(r => r.shorthand === key)) {
        result.push({ state: u.state, shorthand: key, rate: u.rate });
      }
    });
    return result;
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
    setPricing({
      ...defaultPricing,
      oceanRates: (baseOceanRates.length ? baseOceanRates : defaultPricing.oceanRates),
    });
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

          <div className="grid grid-cols-1 gap-6">
            {/* Ocean Fees (per port) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Ocean Fees (per port)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(baseOceanRates.length ? baseOceanRates : defaultPricing.oceanRates).map((defRate, idx) => {
                    const shorthand = (defRate.shorthand || '').toString().trim().toUpperCase();
                    const userRate = pricing.oceanRates.find(r => (r.shorthand || '').toString().trim().toUpperCase() === shorthand);
                    const current = userRate?.rate ?? defRate.rate;
                    return (
                      <div key={`${shorthand}-${idx}`} className="space-y-2 border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`ocean-${shorthand}`}>{defRate.state}</Label>
                          <Badge variant="outline">{shorthand}</Badge>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            id={`ocean-${shorthand}`}
                            type="number"
                            value={current}
                            onFocus={handleNumericInputFocus}
                            onChange={(e) => {
                              const value = e.target.value;
                              let newRateVal: number;
                              if (value === "" || value === "0") {
                                newRateVal = 0;
                              } else {
                                newRateVal = parseInt(value) || 0;
                              }
                              setPricing(prev => {
                                const nextRates = mergeOceanRates((baseOceanRates.length ? baseOceanRates : defaultPricing.oceanRates), prev.oceanRates);
                                const idxToUpdate = nextRates.findIndex(r => (r.shorthand || '').toString().trim().toUpperCase() === shorthand);
                                if (idxToUpdate >= 0) {
                                  nextRates[idxToUpdate] = { ...nextRates[idxToUpdate], rate: newRateVal };
                                } else {
                                  nextRates.push({ state: defRate.state, shorthand, rate: newRateVal });
                                }
                                return { ...prev, oceanRates: nextRates };
                              });
                            }}
                            className="pl-8"
                            min="0"
                            disabled={!useCustomPricing}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Default:</span>
                          <span className="font-mono">${defRate.rate}</span>
                          {current !== defRate.rate && (
                            <Badge variant={current > defRate.rate ? "default" : "secondary"}>
                              {current > defRate.rate ? "+" : ""}{current - defRate.rate}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(baseOceanRates.length ? baseOceanRates : defaultPricing.oceanRates).length === 0 && (
                    <div className="text-sm text-muted-foreground">No default ocean rates configured.</div>
                  )}
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
                      className="pl-8"
                      disabled={!useCustomPricing}
                      onFocus={handleNumericInputFocus}
                      onChange={(e) => handleNumericInputChange(e, (val) => setPricing(prev => ({ ...prev, groundFeeAdjustment: val })))}
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
                      className="pl-8"
                      min="0"
                      disabled={!useCustomPricing}
                      onFocus={handleNumericInputFocus}
                      onChange={(e) => handleNumericInputChange(e, (val) => setPricing(prev => ({ ...prev, pickupSurcharge: val })))}
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
                      className="pl-8"
                      min="0"
                      disabled={!useCustomPricing}
                      onFocus={handleNumericInputFocus}
                      onChange={(e) => handleNumericInputChange(e, (val) => setPricing(prev => ({ ...prev, serviceFee: val })))}
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
                      className="pl-8"
                      min="0"
                      disabled={!useCustomPricing}
                      onFocus={handleNumericInputFocus}
                      onChange={(e) => handleNumericInputChange(e, (val) => setPricing(prev => ({ ...prev, hybridSurcharge: val })))}
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