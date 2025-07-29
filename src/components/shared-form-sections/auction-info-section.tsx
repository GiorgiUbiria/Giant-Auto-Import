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
        setIsLoading(true);
        
        // Check if we're in the browser environment
        if (typeof window === 'undefined') {
          // SSR: Use fallback data
          if (isMounted) {
            setAuctionData([]);
            setIsLoading(false);
          }
          return;
        }
        
        // Client-side: Load dynamic data
        const calculatorUtils = await import("@/lib/calculator-utils");
        const dynamicData = await calculatorUtils.getActiveCsvData();
        
        // Ensure data is valid and filter out any invalid entries
        const validData = Array.isArray(dynamicData) ? dynamicData.filter(item => 
          item && 
          typeof item === 'object' && 
          item.auctionLocation && 
          item.auction &&
          item.port
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

  // Get available ports for the selected auction location
  const availablePorts = useMemo(() => {
    if (!selectedAuctionLocation || !auctionData.length) {
      return [];
    }

    // Find all unique ports for the selected auction location
    const locationPorts = auctionData
      .filter((data: AuctionData) => 
        data.auctionLocation === selectedAuctionLocation && 
        data.auction === selectedAuction
      )
      .map((data: AuctionData) => data.port);

    // Remove duplicates and return unique ports
    return Array.from(new Set(locationPorts));
  }, [selectedAuctionLocation, selectedAuction, auctionData]);

  // Get auction locations for the selected auction
  const auctionLocations = useMemo(() => {
    if (!selectedAuction || !auctionData.length) {
      return [];
    }

    // Find all unique auction locations for the selected auction
    const locations = auctionData
      .filter((data: AuctionData) => data.auction === selectedAuction)
      .map((data: AuctionData) => data.auctionLocation);

    // Remove duplicates and return unique locations
    return Array.from(new Set(locations));
  }, [selectedAuction, auctionData]);

  // Handle auction change
  const handleAuctionChange = useCallback((value: string) => {
    setSelectedAuction(value);
    setSelectedAuctionLocation("");
    form.setValue("auctionLocation", "");
    form.setValue("originPort", "");
  }, [form]);

  // Handle auction location change
  const handleAuctionLocationChange = useCallback((value: string) => {
    setSelectedAuctionLocation(value);
    form.setValue("originPort", "");
  }, [form]);

  // Handle origin port change
  const handleOriginPortChange = useCallback((value: string) => {
    form.setValue("originPort", value);
  }, [form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auction Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="auction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Auction</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleAuctionChange(value);
                }}
                defaultValue={field.value}
                disabled={isLoading}
              >
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
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleAuctionLocationChange(value);
                }}
                value={field.value}
                disabled={!selectedAuction || isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedAuction ? "Select auction first" : auctionLocations.length === 0 ? "No locations available" : "Select auction location"} />
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
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleOriginPortChange(value);
                }}
                value={field.value}
                disabled={!selectedAuctionLocation || availablePorts.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedAuctionLocation ? "Select auction location first" : availablePorts.length === 0 ? "No ports available" : "Select origin port"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availablePorts.map((port) => (
                    <SelectItem key={port} value={port}>
                      {port}
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
          name="trackingLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracking Link</FormLabel>
              <FormControl>
                <Input placeholder="Enter tracking link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
} 