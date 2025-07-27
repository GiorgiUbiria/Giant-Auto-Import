"use client";

import { UseFormReturn } from "react-hook-form";
import { useState, useEffect, useMemo, useCallback } from "react";
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

// Memoized auction data to prevent unnecessary re-computations
const useAuctionData = () => {
  const [auctionData, setAuctionData] = useState<AuctionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAuctionData = async () => {
      try {
        // Use dynamic import to reduce initial bundle size
        const calculatorUtils = await import("@/lib/calculator-utils");
        const data = calculatorUtils.getAuctionData();
        
        // Ensure data is valid and filter out any invalid entries
        const validData = Array.isArray(data) ? data.filter(item => 
          item && 
          typeof item === 'object' && 
          item.auctionLocation && 
          item.auction
        ) : [];
        
        if (isMounted) {
          setAuctionData(validData);
        }
      } catch (error) {
        console.error("Error loading auction data:", error);
        if (isMounted) {
          setAuctionData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAuctionData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { auctionData, isLoading };
};

export function AuctionInfoSection({ form }: AuctionInfoSectionProps) {
  const [selectedAuctionLocation, setSelectedAuctionLocation] = useState("");
  const [selectedAuction, setSelectedAuction] = useState("Copart");
  const { auctionData, isLoading } = useAuctionData();

  // Memoize filtered data to prevent unnecessary re-computations
  const filteredOriginPorts = useMemo(() => {
    return oceanShippingRates.filter((port) =>
      auctionData.some(
        (data: AuctionData) =>
          data.auctionLocation === selectedAuctionLocation &&
          data.port === port.shorthand
      )
    );
  }, [auctionData, selectedAuctionLocation]);

  // Memoize auction locations to prevent unnecessary re-computations
  const auctionLocations = useMemo(() => {
    return Array.from(
      new Set(
        auctionData
          .filter((data: AuctionData) => data.auction === selectedAuction)
          .map((data: AuctionData) => data.auctionLocation)
      )
    );
  }, [auctionData, selectedAuction]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleAuctionLocationChange = useCallback((location: string) => {
    setSelectedAuctionLocation(location);
    form.setValue("auctionLocation", location);
  }, [form]);

  const handleAuctionChange = useCallback((auction: string) => {
    setSelectedAuction(auction);
    setSelectedAuctionLocation("");
    form.setValue("auction", auction);
    form.setValue("auctionLocation", "");
  }, [form]);

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
                <Select onValueChange={handleAuctionChange} defaultValue={field.value}>
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
                <Select onValueChange={handleAuctionLocationChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoading ? "Loading..." : "Select location"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {auctionLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
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
            name="keys"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keys</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select key status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="YES">Yes</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select title status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="YES">Yes</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
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
                      <SelectValue placeholder="Select shipping status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AUCTION">Auction</SelectItem>
                    <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
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