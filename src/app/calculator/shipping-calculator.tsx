"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import {
  auctionData,
  oceanShippingRates,
  extraFees,
  styleToJson,
  parseVirtualBidData,
} from "@/lib/utils";
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

  const calculateFee = (feeData: any[], value: number): number => {
    for (const entry of feeData) {
      if (
        value >= entry.minPrice &&
        (entry.maxPrice === "%" || value <= entry.maxPrice)
      ) {
        if (typeof entry.fee === "string" && entry.fee.includes("%")) {
          const percentage = parseFloat(entry.fee) / 100;
          return value * percentage;
        } else {
          return entry.fee;
        }
      }
    }
    return 0;
  };

  const calculateTotalPurchaseFee = (purchasePrice: number): number => {
    const auctionFee = calculateFee(styleData, purchasePrice);
    const virtualBidFee = calculateFee(virtualBidData, purchasePrice);
    const fixedFees = 79 + 20 + 10;
    if (insurance) {
      return purchasePrice * 1.015 + auctionFee + virtualBidFee + fixedFees;
    } else {
      return purchasePrice + auctionFee + virtualBidFee + fixedFees;
    }
  };

  const calculateShippingFee = (
    auctionLoc: string,
    auctionName: string,
    portName: string,
    additionalFeeTypes: string[]
  ): number => {
    const groundFee =
      auctionData.find(
        (data) =>
          data.auction === auctionName && data.auctionLocation === auctionLoc
      )?.rate || 0;
    const oceanFee =
      oceanShippingRates.find((rate) => rate.shorthand === portName)?.rate || 0;
    const extraFeesTotal = additionalFeeTypes.reduce(
      (total, fee) =>
        total +
        (extraFees.find((extraFee) => extraFee.type === fee)?.rate ?? 0),
      0
    );
    return groundFee + oceanFee + extraFeesTotal;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const totalPurchaseFee = calculateTotalPurchaseFee(purchaseFee);
    const shippingFee = calculateShippingFee(
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
    <Card className="w-full max-w-4xl shadow-lg transition-all duration-200 hover:shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-primary dark:drop-shadow-[0_1.3px_1.3px_rgba(0,0,0,1)] bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCalculate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bid" className="text-base">{t('enterBid')}</Label>
                <Input
                  id="bid"
                  value={purchaseFee}
                  onChange={(e) => setPurchaseFee(parseFloat(e.target.value))}
                  type="number"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="auction">{t('selectAuction')}</Label>
                <Select onValueChange={handleAuctionChange} value={auction}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectAuction')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Copart">Copart</SelectItem>
                    <SelectItem value="IAAI">IAAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="auctionLocation" className="text-base">{t('selectAuctionLocation')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between transition-all duration-200 hover:border-primary",
                        !auctionLocation && "text-muted-foreground"
                      )}
                    >
                      {auctionLocation || t('selectAuctionLocation')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder={t('searchAuctionLocation')} />
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
                              className="text-primary"
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
              <div>
                <Label htmlFor="fromPort">{t('fromUSAPort')}</Label>
                <Select value={port} disabled>
                  <SelectTrigger>
                    <SelectValue>{port}</SelectValue>
                  </SelectTrigger>
                </Select>
              </div>
              <div>
                <Label htmlFor="destinationPort">{t('destinationPort')}</Label>
                <Select value="Poti" disabled>
                  <SelectTrigger>
                    <SelectValue>Poti</SelectValue>
                  </SelectTrigger>
                </Select>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">{t('additionalFees')}</Label>
                <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                  {extraFees.map((fee) => (
                    <div key={fee.type} className="flex items-center space-x-3 transition-all duration-200 hover:bg-muted/80 p-2 rounded">
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
                        className="data-[state=checked]:bg-primary"
                      />
                      <label
                        htmlFor={fee.type}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {fee.type} (${fee.rate})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 p-4 rounded-lg bg-primary/5">
                <p className="text-lg font-semibold mb-4">
                  {t('estimatedTotalFee')}{" "}
                  <span className="text-2xl font-bold text-primary">
                    ${estimatedFee.toFixed(2)}
                  </span>
                </p>
                <Button
                  type="submit"
                  className="w-full transition-all duration-200 hover:scale-[1.02]"
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
