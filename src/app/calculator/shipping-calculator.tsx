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
  saveCalculationAtom,
} from "@/lib/calculator-atoms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShippingCalculator({
  style,
  userId
}: {
  style: string;
  userId?: string;
}) {
  const t = useTranslations('ShippingCalculator');
  const [isCalculating, setIsCalculating] = useState(false);

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
  const [, saveCalculation] = useAtom(saveCalculationAtom);

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

    // Validate required fields
    if (!purchaseFee || purchaseFee <= 0) {
      alert("Please enter a valid purchase fee");
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
      const totalPurchaseFee = await calculateTotalPurchaseFee(purchaseFee, styleData, virtualBidData, insurance, userId);
      const shippingFee = await calculateShippingFee(
        auctionLocation,
        auction,
        port,
        additionalFees,
        userId
      );
      const totalFee = totalPurchaseFee + shippingFee;

      setEstimatedFee(totalFee);

      // Save calculation to history
      saveCalculation();
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
      <Card className="w-full max-w-4xl shadow-lg transition-all duration-300 hover:shadow-xl border-black dark:border-border/20">
        <CardContent className="flex flex-col items-center justify-center gap-3 p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl shadow-lg transition-all duration-300 hover:shadow-xl border-black dark:border-border/20">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-primary dark:text-primary/90 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {t('title')}
        </CardTitle>
        <p className="text-muted-foreground text-sm sm:text-base">{t('description')}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCalculate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bid" className="text-base font-medium">{t('enterBid')}</Label>
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
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary dark:focus:ring-primary/80 dark:bg-muted/50"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auction" className="text-base font-medium">{t('selectAuction')}</Label>
                <Select onValueChange={handleAuctionChange} value={auction}>
                  <SelectTrigger className="transition-all duration-200 hover:border-primary dark:hover:border-primary/80">
                    <SelectValue placeholder={t('selectAuction')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Copart">Copart</SelectItem>
                    <SelectItem value="IAAI">IAAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="auctionLocation" className="text-base font-medium">{t('selectAuctionLocation')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between transition-all duration-200 hover:border-primary dark:hover:border-primary/80",
                        !auctionLocation && "text-muted-foreground"
                      )}
                    >
                      {auctionLocation || t('selectAuctionLocation')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command className="rounded-lg border shadow-md dark:border-border/20">
                      <CommandInput placeholder={t('searchAuctionLocation')} className="h-9" />
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
                              className="text-primary cursor-pointer transition-colors hover:bg-muted/50 dark:hover:bg-muted/30"
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
              <div className="space-y-2">
                <Label htmlFor="fromPort" className="text-base font-medium">{t('fromUSAPort')}</Label>
                <Select value={port} disabled>
                  <SelectTrigger className="transition-all duration-200 bg-muted/50 dark:bg-muted/30">
                    <SelectValue>{port}</SelectValue>
                  </SelectTrigger>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinationPort" className="text-base font-medium">{t('destinationPort')}</Label>
                <Select value="Poti" disabled>
                  <SelectTrigger className="transition-all duration-200 bg-muted/50 dark:bg-muted/30">
                    <SelectValue>Poti</SelectValue>
                  </SelectTrigger>
                </Select>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">{t('additionalFees')}</Label>
                <div className="space-y-3 p-4 rounded-lg bg-muted/50 dark:bg-muted/30 border border-border/20 dark:border-border/10">
                  {extraFees.map((fee) => (
                    <div key={fee.type} className="flex items-center space-x-3 transition-all duration-200 hover:bg-muted/80 dark:hover:bg-muted/50 p-2 rounded">
                      <Checkbox
                        id={fee.type}
                        checked={additionalFees.includes(fee.type)}
                        onCheckedChange={() => toggleAdditionalFee(fee.type)}
                        className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary/90"
                      />
                      <label
                        htmlFor={fee.type}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {fee.type}
                      </label>
                    </div>
                  ))}
                  {/* Insurance Checkbox */}
                  <div className="flex items-center space-x-3 transition-all duration-200 hover:bg-muted/80 dark:hover:bg-muted/50 p-2 rounded">
                    <Checkbox
                      id="insurance"
                      checked={insurance}
                      onCheckedChange={(checked) => setInsurance(!!checked)}
                      className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary/90"
                    />
                    <label
                      htmlFor="insurance"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t('insurance')}
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-6 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20">
                <p className="text-lg font-semibold mb-4">
                  {t('estimatedTotalFee')}{" "}
                  <span className="text-2xl font-bold text-primary dark:text-primary/90">
                    ${estimatedFee.toFixed(2)}
                  </span>
                </p>
                <Button
                  type="submit"
                  disabled={!isFormValid || isCalculating}
                  className="w-full transition-all duration-200 hover:scale-[1.02] bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCalculating ? t('calculating') : t('calculate')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
