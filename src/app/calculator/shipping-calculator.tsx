"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import {
  auctionData,
  oceanShippingRates,
  extraFees,
  styleToJson,
  parseVirtualBidData,
  calculateTotalPurchaseFee,
  calculateShippingFee,
} from "@/lib/calculator-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShippingCalculator({ style }: { style: string }) {
  const t = useTranslations('ShippingCalculator');
  const [auctionLocation, setAuctionLocation] = useState("");
  const [auction, setAuction] = useState("");
  const [purchaseFee, setPurchaseFee] = useState(0);
  const [port, setPort] = useState("");
  const [additionalFees, setAdditionalFees] = useState<string[]>([]);
  const [insurance, setInsurance] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState(0);

  const styleData = styleToJson(style);
  const virtualBidData = parseVirtualBidData();

  // Use imported utility functions instead of local ones

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalPurchaseFee = await calculateTotalPurchaseFee(purchaseFee, styleData, virtualBidData, insurance);
    const shippingFee = await calculateShippingFee(
      auctionLocation,
      auction,
      port,
      additionalFees
    );
    const totalFee = totalPurchaseFee + shippingFee;

    setEstimatedFee(totalFee);
  };

  const handleAuctionLocationChange = (location: string) => {
    setAuctionLocation(location);
    const availablePorts = auctionData
      .filter((data) => data.auctionLocation === location)
      .map((data) => data.port);
    const [availablePort] = availablePorts;
    setPort(availablePort || "");
  };

  const handleAuctionChange = (auction: string) => {
    setAuction(auction);
    setAuctionLocation("");
    setPort("");
  };

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
                  onChange={(e) => setPurchaseFee(parseFloat(e.target.value))}
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
                          {Array.from(
                            new Set(
                              auctionData
                                .filter((data) => data.auction === auction)
                                .map((data) => data.auctionLocation)
                            )
                          ).map((location) => (
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
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAdditionalFees([...additionalFees, fee.type]);
                          } else {
                            setAdditionalFees(
                              additionalFees.filter((f) => f !== fee.type)
                            );
                          }
                        }}
                        className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary/90"
                      />
                      <label
                        htmlFor={fee.type}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {fee.type} (${fee.rate})
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
                      {t('insurance')} (1.5%)
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
                  className="w-full transition-all duration-200 hover:scale-[1.02] bg-primary hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary/80"
                >
                  {t('calculate')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
