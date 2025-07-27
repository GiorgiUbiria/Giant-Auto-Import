"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { useServerAction } from "zsa-react";
import { getDefaultPricingAction, updateDefaultPricingAction } from "@/lib/actions/pricingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, DollarSign, Truck, FileText, Zap } from "lucide-react";
import { toast } from "sonner";

export const DefaultPricingForm = () => {
  const t = useTranslations('PricingManagement');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState({
    oceanFee: 1025,
    groundFeeAdjustment: 0,
    pickupSurcharge: 300,
    serviceFee: 100,
    hybridSurcharge: 150,
  });

  const { execute: getDefaultPricing } = useServerAction(getDefaultPricingAction);
  const { execute: updateDefaultPricing } = useServerAction(updateDefaultPricingAction);

  useEffect(() => {
    loadDefaultPricing();
  }, []);

  const loadDefaultPricing = async () => {
    try {
      setLoading(true);
      const [result, error] = await getDefaultPricing();
      if (error) {
        toast.error("Failed to load default pricing");
        return;
      }
      if (result.success && result.data) {
        setPricing({
          oceanFee: result.data.oceanFee,
          groundFeeAdjustment: result.data.groundFeeAdjustment,
          pickupSurcharge: result.data.pickupSurcharge,
          serviceFee: result.data.serviceFee,
          hybridSurcharge: result.data.hybridSurcharge,
        });
      }
    } catch (error) {
      toast.error("Failed to load default pricing");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const [result, error] = await updateDefaultPricing(pricing);
      
      if (error) {
        toast.error("Failed to update default pricing");
        return;
      }
      
      if (result.success) {
        toast.success("Default pricing updated successfully");
      } else {
        toast.error(result.message || "Failed to update default pricing");
      }
    } catch (error) {
      toast.error("Failed to update default pricing");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          These are the default pricing values that apply to all users unless they have custom pricing configured.
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
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Default ocean shipping fee
              </p>
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
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Applied to all ground routes from CSV
              </p>
              {pricing.groundFeeAdjustment !== 0 && (
                <Badge variant={pricing.groundFeeAdjustment > 0 ? "default" : "secondary"}>
                  {pricing.groundFeeAdjustment > 0 ? "Increase" : "Decrease"}
                </Badge>
              )}
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
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Applied to pickup vehicles
              </p>
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
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Documentation and service fee
              </p>
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
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Applied to electric/hybrid vehicles
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Save Default Pricing
        </Button>
      </div>
    </form>
  );
}; 