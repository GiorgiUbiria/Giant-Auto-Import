"use client";

import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import { useAtom, useAtomValue } from 'jotai';
import {
  getAuctionData,
  oceanShippingRates,
  extraFees,
  styleToJson,
  parseVirtualBidData,
  calculateTotalPurchaseFee,
  calculateShippingFee,
  calculateFee,
} from "@/lib/calculator-utils";
import {
  purchaseFeeAtom,
  auctionAtom,
  auctionLocationAtom,
  portAtom,
  additionalFeesAtom,
  insuranceAtom,
  estimatedFeeAtom,
  loadingAtom,
  auctionDataAtom,
  availableAuctionLocationsAtom,
  isFormValidAtom,
  userIdAtom,
  setAuctionLocationAtom,
  setAuctionAtom,
  toggleAdditionalFeeAtom,
} from "@/lib/calculator-atoms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, Calculator, Truck, Ship, DollarSign, MapPin, Building2, ChevronDown, ChevronRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export function ShippingCalculator({
  style,
  userId
}: {
  style: string;
  userId?: string;
}) {
  const t = useTranslations('ShippingCalculator');
  const [isCalculating, setIsCalculating] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    purchase: true,
    shipping: true,
    services: true
  });
  const [calculationResult, setCalculationResult] = useState<{
    totalPurchaseFee: number;
    shippingFee: number;
    totalFee: number;
    breakdown: {
      basePurchaseFee: number;
      auctionFee: number;
      gateFee: number;
      titleFee: number;
      environmentalFee: number;
      virtualBidFee: number;
      groundFee: number;
      oceanFee: number;
      additionalFees: string[];
      insurance: boolean;
    };
  } | null>(null);

  // Initialize user ID atom
  const [, setUserId] = useAtom(userIdAtom);
  useEffect(() => {
    setUserId(userId);
  }, [userId, setUserId]);

  // Handle numeric input focus to clear the field when starting to type
  const handleNumericInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    if (input.value === "0") {
      input.value = "";
    }
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // State atoms
  const [purchaseFee, setPurchaseFee] = useAtom(purchaseFeeAtom);
  const [auction, setAuction] = useAtom(auctionAtom);
  const [auctionLocation, setAuctionLocation] = useAtom(auctionLocationAtom);
  const [port, setPort] = useAtom(portAtom);
  const [additionalFees, setAdditionalFees] = useAtom(additionalFeesAtom);
  const [insurance, setInsurance] = useAtom(insuranceAtom);
  const [estimatedFee, setEstimatedFee] = useAtom(estimatedFeeAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [auctionData, setAuctionData] = useAtom(auctionDataAtom);

  // Derived atoms
  const availableAuctionLocations = useAtomValue(availableAuctionLocationsAtom);
  const isFormValid = useAtomValue(isFormValidAtom);

  // Action atoms
  const [, setAuctionLocationAction] = useAtom(setAuctionLocationAtom);
  const [, setAuctionAction] = useAtom(setAuctionAtom);
  const [, toggleAdditionalFee] = useAtom(toggleAdditionalFeeAtom);

  const styleData = styleToJson(style);
  const virtualBidData = parseVirtualBidData();

  // Load auction data on component mount
  useEffect(() => {
    const loadAuctionData = async () => {
      try {
        const data = await getAuctionData();
        setAuctionData(data);
      } catch (error) {
        console.error("Error loading auction data:", error);
        setAuctionData([]);
      } finally {
        setLoading(false);
      }
    };

    loadAuctionData();
  }, [setAuctionData, setLoading]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields (allow 0$ purchase fee)
    if (purchaseFee < 0) {
      alert("Purchase fee cannot be negative");
      return;
    }

    if (!auction) {
      alert("Please select an auction");
      return;
    }

    if (!auctionLocation) {
      alert("Please select an auction location");
      return;
    }

    if (!port) {
      alert("Please select a port");
      return;
    }

    setIsCalculating(true);
    try {
      // Calculate individual fee components
      const auctionFee = calculateFee(styleData, purchaseFee);
      const virtualBidFee = calculateFee(virtualBidData, purchaseFee);
      const gateFee = 79;
      const titleFee = 20;
      const environmentalFee = 10;

      const totalPurchaseFee = purchaseFee + auctionFee + gateFee + titleFee + environmentalFee + virtualBidFee;

      const shippingFee = await calculateShippingFee(
        auctionLocation,
        auction,
        port,
        additionalFees,
        userId
      );
      const totalFee = totalPurchaseFee + shippingFee;

      // Calculate ground and ocean fees separately for breakdown
      const csvData = await getAuctionData();
      const baseGroundFee = csvData.find(
        (data) => data.auction === auction && data.auctionLocation === auctionLocation
      )?.rate || 0;

      // Get user or default pricing for adjustments
      let groundFeeAdjustment = 0;
      let oceanFee = 0;

      if (userId) {
        try {
          const { getUserPricingConfig, getDefaultPricingConfig } = await import("@/lib/calculator-utils");
          const userPricing = await getUserPricingConfig(userId);
          const defaultPricing = await getDefaultPricingConfig();
          const pricing = (userPricing && userPricing.isActive) ? userPricing : defaultPricing;

          groundFeeAdjustment = pricing?.groundFeeAdjustment || 0;

          // Calculate ocean fee
          const normalizedPort = port.toString().trim().toUpperCase();
          if (pricing?.oceanRates && pricing.oceanRates.length > 0) {
            const matched = pricing.oceanRates.find((rate: any) =>
              (rate.shorthand || '').toString().trim().toUpperCase() === normalizedPort
            );
            if (matched) oceanFee = matched.rate;
          }

          if (oceanFee === 0) {
            const { getActiveOceanRates } = await import("@/lib/calculator-utils");
            const activeOceanRates = await getActiveOceanRates();
            const matchedDb = activeOceanRates.find((rate) =>
              (rate.shorthand || '').toString().trim().toUpperCase() === normalizedPort
            );
            if (matchedDb) oceanFee = matchedDb.rate;
          }

          if (oceanFee === 0) {
            const matchedHardcoded = oceanShippingRates.find((rate) =>
              (rate.shorthand || '').toString().trim().toUpperCase() === normalizedPort
            );
            oceanFee = matchedHardcoded?.rate || 0;
          }
        } catch (error) {
          console.error("Error getting user pricing:", error);
        }
      }

      const adjustedGroundFee = baseGroundFee + groundFeeAdjustment;

      setEstimatedFee(totalFee);

      // Store detailed calculation breakdown
      setCalculationResult({
        totalPurchaseFee,
        shippingFee,
        totalFee,
        breakdown: {
          basePurchaseFee: purchaseFee,
          auctionFee: auctionFee + gateFee + titleFee + environmentalFee + virtualBidFee, // Consolidated fee
          gateFee: 0, // Hidden from display
          titleFee: 0, // Hidden from display
          environmentalFee: 0, // Hidden from display
          virtualBidFee: 0, // Hidden from display
          groundFee: adjustedGroundFee,
          oceanFee,
          additionalFees: additionalFees,
          insurance,
        },
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAuctionLocationChange = (location: string) => {
    setAuctionLocationAction(location);
  };

  const handleAuctionChange = (auction: string) => {
    setAuctionAction(auction);
  };

  if (loading) {
    return (
      <Card className="w-full shadow-2xl transition-all duration-500 hover:shadow-3xl border-0 bg-white/95 dark:bg-card/95 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
          <div className="relative">
            <div className="w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-muted animate-pulse"></div>
              <div className="absolute inset-3 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          </div>
          <div className="space-y-3 text-center">
            <div className="h-5 bg-muted rounded-full w-56 animate-pulse"></div>
            <div className="h-4 bg-muted/60 rounded-full w-40 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section - More Compact */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent drop-shadow-sm">
            {t('title')}
          </h1>
        </div>
        <p className="text-base text-foreground max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-sm">
          {t('description')}
        </p>
      </div>

      {/* Main Calculator Layout - Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Compact Calculator Form */}
        <Card className="shadow-2xl transition-all duration-500 hover:shadow-3xl border-0 bg-white/95 dark:bg-card/95 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>
          <CardContent className="relative p-6">
            <form onSubmit={handleCalculate} className="space-y-6">
              {/* Purchase Details Section */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => toggleSection('purchase')}
                  className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold flex items-center space-x-2 text-primary">
                    <DollarSign className="h-4 w-4" />
                    <span>{t('purchaseDetails')}</span>
                  </h3>
                  {expandedSections.purchase ? (
                    <ChevronDown className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-primary" />
                  )}
                </button>

                {expandedSections.purchase && (
                  <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-3">
                      <Label htmlFor="bid" className="text-sm font-medium flex items-center space-x-2 text-foreground">
                        <span>{t('enterBidAmount')}</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-base font-medium">$</span>
                        <Input
                          id="bid"
                          value={purchaseFee}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || value === "0") {
                              setPurchaseFee(0);
                            } else {
                              setPurchaseFee(parseFloat(value) || 0);
                            }
                          }}
                          onFocus={handleNumericInputFocus}
                          type="number"
                          className="pl-8 h-10 text-base font-medium transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background focus:scale-[1.02] bg-white/80 dark:bg-background/30 border-2 hover:border-primary/50 text-foreground"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="auction" className="text-sm font-medium flex items-center space-x-2 text-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{t('selectAuction')}</span>
                      </Label>
                      <Select onValueChange={handleAuctionChange} value={auction}>
                        <SelectTrigger className="h-10 transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background focus:scale-[1.02] bg-white/80 dark:bg-background/30 border-2 text-foreground">
                          <SelectValue placeholder={t('selectAuctionPlatform')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Copart">Copart</SelectItem>
                          <SelectItem value="IAAI">IAAI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="auctionLocation" className="text-sm font-medium flex items-center space-x-2 text-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{t('auctionLocation')}</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full h-10 justify-between transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background focus:scale-[1.02] bg-white/80 dark:bg-background/30 border-2 text-foreground",
                              !auctionLocation && "text-muted-foreground"
                            )}
                          >
                            {auctionLocation || t('selectAuctionLocation')}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command className="rounded-lg border shadow-md dark:border-border/20">
                            <CommandInput placeholder={t('searchAuctionLocation')} className="h-10" />
                            <CommandList>
                              <CommandEmpty>{t('noAuctionLocationFound')}</CommandEmpty>
                              <CommandGroup>
                                {availableAuctionLocations.map((location: string) => (
                                  <CommandItem
                                    key={location}
                                    value={location}
                                    onSelect={(value) => {
                                      handleAuctionLocationChange(value);
                                    }}
                                    className="text-primary cursor-pointer transition-colors hover:bg-muted/50 dark:hover:bg-muted/30 h-10"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        auctionLocation === location ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {location}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="fromPort" className="text-sm font-medium flex items-center space-x-2 text-foreground">
                          <Ship className="h-3 w-3" />
                          <span>{t('fromPort')}</span>
                        </Label>
                        <Select value={port} disabled>
                          <SelectTrigger className="h-9 bg-white/80 dark:bg-muted/30 border-2 text-foreground text-sm">
                            <SelectValue>{port}</SelectValue>
                          </SelectTrigger>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="destinationPort" className="text-sm font-medium flex items-center space-x-2 text-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{t('toPort')}</span>
                        </Label>
                        <Select value="Poti" disabled>
                          <SelectTrigger className="h-9 bg-white/80 dark:bg-muted/30 border-2 text-foreground text-sm">
                            <SelectValue>Poti</SelectValue>
                          </SelectTrigger>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Services Section */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => toggleSection('services')}
                  className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold flex items-center space-x-2 text-primary">
                    <Truck className="h-4 w-4" />
                    <span>{t('additionalServices')}</span>
                  </h3>
                  {expandedSections.services ? (
                    <ChevronDown className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-primary" />
                  )}
                </button>

                {expandedSections.services && (
                  <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-3 p-4 rounded-lg bg-white/60 dark:bg-muted/30 border border-border/20 dark:border-border/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {extraFees.map((fee) => (
                          <div key={fee.type} className="flex items-center space-x-2 transition-all duration-200 hover:bg-white/80 dark:hover:bg-muted/60 p-2 rounded-md group">
                            <Checkbox
                              id={fee.type}
                              checked={additionalFees.includes(fee.type)}
                              onCheckedChange={() => toggleAdditionalFee(fee.type)}
                              className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary/90 transition-all duration-200 scale-110 group-hover:scale-125"
                            />
                            <label
                              htmlFor={fee.type}
                              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer group-hover:text-primary transition-colors text-foreground"
                            >
                              {fee.type}
                            </label>
                          </div>
                        ))}
                      </div>

                      {/* Insurance Checkbox */}
                      <div className="flex items-center space-x-2 transition-all duration-200 hover:bg-white/80 dark:hover:bg-muted/60 p-2 rounded-md group border-t border-border/20 pt-3">
                        <Checkbox
                          id="insurance"
                          checked={insurance}
                          onCheckedChange={(checked) => setInsurance(!!checked)}
                          className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary/90 transition-all duration-200 scale-110 group-hover:scale-125"
                        />
                        <label
                          htmlFor="insurance"
                          className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer group-hover:text-primary transition-colors text-foreground"
                        >
                          {t('insurance')}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Calculate Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isCalculating}
                className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCalculating ? t('calculating') : t('calculate')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column - Compact Results Display */}
        <div className="space-y-4">
          {calculationResult ? (
            <Card className="shadow-2xl transition-all duration-500 hover:shadow-3xl border-0 bg-white/95 dark:bg-card/95 backdrop-blur-sm overflow-hidden h-fit sticky top-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 opacity-50"></div>
              <CardContent className="relative p-6">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-primary">{t('calculationResults')}</h3>
                    <p className="text-sm text-foreground font-medium">{t('detailedBreakdown')}</p>
                  </div>

                  {/* Purchase Fee Breakdown */}
                  <div className="space-y-3 p-3 rounded-lg bg-white/80 dark:bg-background/60 border border-border/20">
                    <h4 className="font-semibold text-base flex items-center space-x-2 text-primary">
                      <DollarSign className="h-4 w-4" />
                      <span>{t('purchaseCosts')}</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1.5 border-b border-border/20 last:border-b-0">
                        <span className="text-xs text-foreground">{t('basePurchaseFee')}</span>
                        <span className="font-mono font-semibold text-sm">{formatCurrency(calculationResult.breakdown.basePurchaseFee)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-border/20 last:border-b-0">
                        <span className="text-xs text-foreground">{t('auctionFeeIncludes')}</span>
                        <span className="font-mono font-semibold text-sm">{formatCurrency(calculationResult.breakdown.auctionFee)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 bg-primary/5 rounded-md px-2">
                        <span className="font-medium text-primary text-sm">{t('totalPurchaseFee')}</span>
                        <span className="font-mono font-bold text-lg text-primary">{formatCurrency(calculationResult.totalPurchaseFee)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Fee Breakdown */}
                  <div className="space-y-3 p-3 rounded-lg bg-white/80 dark:bg-background/60 border border-border/20">
                    <h4 className="font-semibold text-base flex items-center space-x-2 text-primary">
                      <Truck className="h-4 w-4" />
                      <span>{t('shippingCosts')}</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1.5 border-b border-border/20 last:border-b-0">
                        <span className="text-xs text-foreground">{t('groundFee')}</span>
                        <span className="font-mono font-semibold text-sm">{formatCurrency(calculationResult.breakdown.groundFee)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-border/20 last:border-b-0">
                        <span className="text-xs text-foreground">{t('oceanFee')}</span>
                        <span className="font-mono font-semibold text-sm">{formatCurrency(calculationResult.breakdown.oceanFee)}</span>
                      </div>
                      {calculationResult.breakdown.additionalFees.length > 0 && (
                        <div className="flex justify-between items-center py-1.5 border-b border-border/20 last:border-b-0">
                          <span className="text-xs text-foreground">{t('additionalFeesLabel')}</span>
                          <span className="text-xs text-muted-foreground max-w-24 text-right">
                            {calculationResult.breakdown.additionalFees.join(', ')}
                          </span>
                        </div>
                      )}
                      {calculationResult.breakdown.insurance && (
                        <div className="flex justify-between items-center py-1.5 border-b border-border/20 last:border-b-0">
                          <span className="text-xs text-foreground">{t('insuranceIncluded')}</span>
                          <span className="text-primary font-medium text-xs">{t('included')}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-2 bg-primary/5 rounded-md px-2">
                        <span className="font-medium text-primary text-sm">{t('totalShippingFee')}</span>
                        <span className="font-mono font-bold text-lg text-primary">{formatCurrency(calculationResult.shippingFee)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">{t('totalEstimatedFee')}</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(calculationResult.totalFee)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-2xl transition-all duration-500 hover:shadow-3xl border-0 bg-white/95 dark:bg-card/95 backdrop-blur-sm overflow-hidden h-fit sticky top-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>
              <CardContent className="relative p-6">
                <div className="text-center space-y-3">
                  <div className="p-4 rounded-lg bg-white/60 dark:bg-muted/30 border-2 border-dashed border-border/30">
                    <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-base font-semibold text-foreground mb-1">
                      {t('readyToCalculate')}
                    </p>
                    <p className="text-xs text-foreground">
                      {t('readyToCalculateDescription')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
