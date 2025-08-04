"use client";

import { useEffect, useCallback } from "react";
import { useTranslations } from 'next-intl';
import { useServerAction } from "zsa-react";
import { useAtom, useAtomValue } from 'jotai';
import {
  getDefaultPricingAction,
  updateDefaultPricingAction,
  getOceanShippingRatesAction,
  addOceanShippingRateAction,
  updateOceanShippingRateAction,
  deleteOceanShippingRateAction,
  seedOceanShippingRatesAction
} from "@/lib/actions/pricingActions";
import {
  defaultPricingAtom,
  oceanRatesAtom,
  editingRateAtom,
  newRateAtom,
  pricingLoadingAtom,
  pricingSavingAtom,
  updateDefaultPricingFieldAtom,
  setDefaultPricingAtom,
  addOceanRateAtom,
  updateOceanRateAtom,
  deleteOceanRateAtom,
  setOceanRatesAtom,
  setEditingRateAtom,
  updateNewRateFieldAtom,
  resetNewRateAtom,
  setPricingLoadingAtom,
  setPricingSavingAtom,
  OceanRate,
} from '@/lib/pricing-atoms';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Loader2,
  Save,
  DollarSign,
  Truck,
  FileText,
  Zap,
  Plus,
  Edit,
  Trash2,
  X,
  Check
} from "lucide-react";
import { toast } from "sonner";

export const DefaultPricingForm = () => {
  const t = useTranslations('PricingManagement');

  // Jotai atoms
  const pricing = useAtomValue(defaultPricingAtom);
  const oceanRates = useAtomValue(oceanRatesAtom);
  const editingRate = useAtomValue(editingRateAtom);
  const newRate = useAtomValue(newRateAtom);
  const loading = useAtomValue(pricingLoadingAtom);
  const saving = useAtomValue(pricingSavingAtom);

  // Action atoms
  const [, updatePricingField] = useAtom(updateDefaultPricingFieldAtom);
  const [, setPricing] = useAtom(setDefaultPricingAtom);
  const [, addRate] = useAtom(addOceanRateAtom);
  const [, updateRate] = useAtom(updateOceanRateAtom);
  const [, deleteRate] = useAtom(deleteOceanRateAtom);
  const [, setRates] = useAtom(setOceanRatesAtom);
  const [, setEditing] = useAtom(setEditingRateAtom);
  const [, updateNewRateField] = useAtom(updateNewRateFieldAtom);
  const [, resetNewRate] = useAtom(resetNewRateAtom);
  const [, setLoading] = useAtom(setPricingLoadingAtom);
  const [, setSaving] = useAtom(setPricingSavingAtom);

  const { execute: getDefaultPricing } = useServerAction(getDefaultPricingAction);
  const { execute: updateDefaultPricing } = useServerAction(updateDefaultPricingAction);
  const { execute: getOceanShippingRates } = useServerAction(getOceanShippingRatesAction);
  const { execute: addOceanShippingRate } = useServerAction(addOceanShippingRateAction);
  const { execute: updateOceanShippingRate } = useServerAction(updateOceanShippingRateAction);
  const { execute: deleteOceanShippingRate } = useServerAction(deleteOceanShippingRateAction);
  const { execute: seedOceanShippingRates } = useServerAction(seedOceanShippingRatesAction);

  const loadDefaultPricing = useCallback(async () => {
    try {
      setLoading(true);
      const [result, error] = await getDefaultPricing();
      if (error) {
        toast.error("Failed to load default pricing");
        return;
      }
      if (result.success && result.data) {
        setPricing({
          oceanRates: Array.isArray(result.data.oceanRates) ? (result.data.oceanRates as unknown as OceanRate[]) : [],
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
  }, [getDefaultPricing, setPricing, setLoading]);

  const loadOceanShippingRates = useCallback(async () => {
    try {
      const [result, error] = await getOceanShippingRates();
      if (error) {
        toast.error("Failed to load ocean shipping rates");
        return;
      }
      if (result.success) {
        setRates(result.data);
      }
    } catch (error) {
      toast.error("Failed to load ocean shipping rates");
    }
  }, [getOceanShippingRates, setRates]);

  useEffect(() => {
    loadDefaultPricing();
    loadOceanShippingRates();
  }, [loadDefaultPricing, loadOceanShippingRates]);

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

  const handleInputChange = (field: 'groundFeeAdjustment' | 'pickupSurcharge' | 'serviceFee' | 'hybridSurcharge', value: string) => {
    const numValue = parseInt(value) || 0;
    updatePricingField(field, numValue);
  };

  const handleAddOceanRate = async () => {
    if (!newRate.state || !newRate.shorthand || newRate.rate <= 0) {
      toast.error("Please fill in all fields for the ocean rate");
      return;
    }

    try {
      const [result, error] = await addOceanShippingRate(newRate);
      if (error) {
        toast.error("Failed to add ocean rate");
        return;
      }
      if (result.success) {
        toast.success("Ocean rate added successfully");
        resetNewRate();
        loadOceanShippingRates();
      }
    } catch (error) {
      toast.error("Failed to add ocean rate");
    }
  };

  const handleUpdateOceanRate = async () => {
    if (!editingRate?.id || !editingRate.state || !editingRate.shorthand || editingRate.rate <= 0) {
      toast.error("Please fill in all fields for the ocean rate");
      return;
    }

    try {
      const [result, error] = await updateOceanShippingRate({
        id: editingRate.id,
        state: editingRate.state,
        shorthand: editingRate.shorthand,
        rate: editingRate.rate,
      });
      if (error) {
        toast.error("Failed to update ocean rate");
        return;
      }
      if (result.success) {
        toast.success("Ocean rate updated successfully");
        setEditing(null);
        loadOceanShippingRates();
      }
    } catch (error) {
      toast.error("Failed to update ocean rate");
    }
  };

  const handleDeleteOceanRate = async (id: number) => {
    try {
      const [result, error] = await deleteOceanShippingRate({ id });
      if (error) {
        toast.error("Failed to delete ocean rate");
        return;
      }
      if (result.success) {
        toast.success("Ocean rate deleted successfully");
        loadOceanShippingRates();
      }
    } catch (error) {
      toast.error("Failed to delete ocean rate");
    }
  };

  const handleSeedOceanRates = async () => {
    try {
      const [result, error] = await seedOceanShippingRates();
      if (error) {
        toast.error("Failed to seed ocean rates");
        return;
      }
      if (result.success) {
        toast.success(`Ocean rates seeded successfully: ${result.seededCount} rates added`);
        loadOceanShippingRates();
      }
    } catch (error) {
      toast.error("Failed to seed ocean rates");
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
      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          These are the default pricing values that apply to all users unless they have custom pricing configured.
        </AlertDescription>
      </Alert>

      {/* Ocean Shipping Rates Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Ocean Shipping Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Rate */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="newState">State/Location</Label>
              <Input
                id="newState"
                placeholder="e.g., Los Angeles, CA"
                value={newRate.state}
                onChange={(e) => updateNewRateField('state', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newShorthand">Shorthand</Label>
              <Input
                id="newShorthand"
                placeholder="e.g., CA"
                value={newRate.shorthand}
                onChange={(e) => updateNewRateField('shorthand', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newRate">Rate ($)</Label>
              <Input
                id="newRate"
                type="number"
                placeholder="1025"
                value={newRate.rate}
                onChange={(e) => updateNewRateField('rate', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleAddOceanRate}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Rate
              </Button>
            </div>
          </div>

          {/* Ocean Rates Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State/Location</TableHead>
                  <TableHead>Shorthand</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oceanRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      {editingRate?.id === rate.id ? (
                        <Input
                          value={editingRate?.state || ""}
                          onChange={(e) => setEditing(editingRate ? { ...editingRate, state: e.target.value } : null)}
                        />
                      ) : (
                        rate.state
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRate?.id === rate.id ? (
                        <Input
                          value={editingRate?.shorthand || ""}
                          onChange={(e) => setEditing(editingRate ? { ...editingRate, shorthand: e.target.value } : null)}
                        />
                      ) : (
                        rate.shorthand
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRate?.id === rate.id ? (
                        <Input
                          type="number"
                          value={editingRate?.rate || 0}
                          onChange={(e) => setEditing(editingRate ? { ...editingRate, rate: parseInt(e.target.value) || 0 } : null)}
                          min="0"
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono">{rate.rate}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingRate?.id === rate.id ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleUpdateOceanRate}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditing(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditing(rate)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteOceanRate(rate.id!)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {oceanRates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      <div className="space-y-4">
                        <p>No ocean shipping rates configured.</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSeedOceanRates}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Seed Default Ocean Rates
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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