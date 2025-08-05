"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"

type Props = {
  purchaseFee: number;
  auctionFee: number;
  gateFee: number;
  titleFee: number;
  environmentalFee: number;
  virtualBidFee: number;
  shippingFee: number;
  groundFee: number;
  oceanFee: number;
  totalFee: number;
  insurance?: "YES" | "NO";
}

export const TotalFeeDetails = ({ purchaseFee, auctionFee, gateFee, titleFee, environmentalFee, virtualBidFee, shippingFee, groundFee, oceanFee, totalFee, insurance }: Props) => {
  return (
    <div>
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="font-medium hover:text-primary/80 transition-colors">
            ${totalFee.toLocaleString()}
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Purchase Details</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Base Purchase Fee:</span>
                  <span className="font-medium">${purchaseFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Auction Fee:</span>
                  <span className="font-medium">${auctionFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Gate Fee:</span>
                  <span className="font-medium">${gateFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Title Fee:</span>
                  <span className="font-medium">${titleFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Environmental Fee:</span>
                  <span className="font-medium">${environmentalFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Virtual Bid Fee:</span>
                  <span className="font-medium">${virtualBidFee.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center py-0.5 font-semibold text-primary">
                  <span className="text-muted-foreground">Total Purchase Fee:</span>
                  <span className="font-medium">${(purchaseFee + auctionFee + gateFee + titleFee + environmentalFee + virtualBidFee).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Shipping Details</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Ground Fee:</span>
                  <span className="font-medium">${groundFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Ocean Fee:</span>
                  <span className="font-medium">${oceanFee.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center py-0.5 font-semibold text-primary">
                  <span className="text-muted-foreground">Total Shipping Fee:</span>
                  <span className="font-medium">${shippingFee.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Separator />

            {insurance === "YES" && (
              <div className="space-y-1">
                <div className="flex justify-between items-center py-0.5 font-semibold text-primary">
                  <span className="text-muted-foreground">Insurance Fee (1.5%):</span>
                  <span className="font-medium">${Math.round((purchaseFee + auctionFee + gateFee + titleFee + environmentalFee + virtualBidFee + shippingFee) * 0.015).toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
              </div>
            )}

            <div className="flex justify-between items-center py-0.5 text-lg font-bold text-primary">
              <span className="text-muted-foreground">Total Fee:</span>
              <span className="font-medium">${totalFee.toLocaleString()}</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
} 
