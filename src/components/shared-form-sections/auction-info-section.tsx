"use client";

import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
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
import { auctionData, oceanShippingRates } from "@/lib/calculator-utils";

interface AuctionInfoSectionProps {
  form: UseFormReturn<any>;
}

export function AuctionInfoSection({ form }: AuctionInfoSectionProps) {
  const [selectedAuctionLocation, setSelectedAuctionLocation] = useState("");
  const [selectedAuction, setSelectedAuction] = useState("Copart");

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
      (data) =>
        data.auctionLocation === selectedAuctionLocation &&
        data.port === port.shorthand
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
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {auctionData
                      .filter((data) => data.auction === selectedAuction)
                      .map((data) => (
                        <SelectItem key={data.auctionLocation} value={data.auctionLocation}>
                          {data.auctionLocation}
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