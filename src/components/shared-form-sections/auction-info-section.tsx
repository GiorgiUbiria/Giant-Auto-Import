"use client";

import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { oceanShippingRates } from "@/lib/calculator-utils";

interface AuctionInfoSectionProps {
  form: UseFormReturn<any>;
}

// Define a type for auction data
interface AuctionData {
  auctionLocation: string;
  auction: string;
  port: string;
  rate: number;
}

export function AuctionInfoSection({ form }: AuctionInfoSectionProps) {
  const [selectedAuctionLocation, setSelectedAuctionLocation] = useState("");
  const [selectedAuction, setSelectedAuction] = useState("Copart");
  const [auctionData, setAuctionData] = useState<AuctionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuctionData = async () => {
      try {
        // Use a try-catch around the dynamic import
        const calculatorUtils = await import("@/lib/calculator-utils");
        const data = calculatorUtils.getAuctionData();
        
        // Ensure data is valid and filter out any invalid entries
        const validData = Array.isArray(data) ? data.filter(item => 
          item && 
          typeof item === 'object' && 
          item.auctionLocation && 
          item.auction
        ) : [];
        setAuctionData(validData);
      } catch (error) {
        console.error("Error loading auction data:", error);
        setAuctionData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuctionData();
  }, []);

  const handleAuctionLocationChange = (location: string) => {
    setSelectedAuctionLocation(location);
    form.setValue("auctionLocation", location);
  };

  const handleAuctionChange = (auction: string) => {
    setSelectedAuction(auction);
    setSelectedAuctionLocation("");
    form.setValue("auction", auction);
    form.setValue("auctionLocation", "");
  };

  const originPorts = oceanShippingRates;
  const filteredOriginPorts = originPorts.filter((port) =>
    auctionData.some(
      (data: AuctionData) =>
        data.auctionLocation === selectedAuctionLocation &&
        data.port === port.shorthand
    )
  );

  // Get unique auction locations for the selected auction
  const auctionLocations = Array.from(
    new Set(
      auctionData
        .filter((data: AuctionData) => data.auction === selectedAuction)
        .map((data: AuctionData) => data.auctionLocation)
    )
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auction Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FormField
            control={form.control}
            name="auction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auction</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  handleAuctionChange(value);
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select auction" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Copart">Copart</SelectItem>
                    <SelectItem value="IAAI">IAAI</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="auctionLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auction Location</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  handleAuctionLocationChange(value);
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoading ? "Loading locations..." : "Select location"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {!isLoading && auctionLocations.length > 0 ? (
                      auctionLocations.map((location: string) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))
                    ) : null}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="originPort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origin Port</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select port" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredOriginPorts.map((port) => (
                      <SelectItem key={port.shorthand} value={port.shorthand}>
                        {port.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lotNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lot Number</FormLabel>
                <FormControl>
                  <Input placeholder="Lot number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bookingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking Number</FormLabel>
                <FormControl>
                  <Input placeholder="Booking number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="containerNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Container Number</FormLabel>
                <FormControl>
                  <Input placeholder="Container number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trackingLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracking Link</FormLabel>
                <FormControl>
                  <Input placeholder="Tracking link" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AUCTION">Auction</SelectItem>
                    <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
} 