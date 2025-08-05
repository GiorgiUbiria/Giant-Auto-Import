"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";

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
  translations: {
    totalPurchaseFee: string;
    basePurchaseFee: string;
    auctionFee: string;
    gateFee: string;
    titleFee: string;
    environmentalFee: string;
    virtualBidFee: string;
    totalPurchaseFeeResult: string;
    shippingFee: string;
    groundFee: string;
    oceanFee: string;
  };
};

export const TotalFeeDetails = ({
  purchaseFee,
  auctionFee,
  gateFee,
  titleFee,
  environmentalFee,
  virtualBidFee,
  shippingFee,
  groundFee,
  oceanFee,
  totalFee,
  insurance,
  translations,
}: Props) => {
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
                  <span className="text-muted-foreground">{translations.basePurchaseFee}:</span>
                  <span className="font-medium">${purchaseFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">{translations.auctionFee}:</span>
                  <span className="font-medium">${auctionFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">{translations.gateFee}:</span>
                  <span className="font-medium">${gateFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">{translations.titleFee}:</span>
                  <span className="font-medium">${titleFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">{translations.environmentalFee}:</span>
                  <span className="font-medium">${environmentalFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">{translations.virtualBidFee}:</span>
                  <span className="font-medium">${virtualBidFee.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center py-0.5 font-semibold text-primary">
                  <span className="text-muted-foreground">{translations.totalPurchaseFee}:</span>
                  <span className="font-medium">${(purchaseFee + auctionFee + gateFee + titleFee + environmentalFee + virtualBidFee).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Shipping Details</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">{translations.groundFee}:</span>
                  <span className="font-medium">${groundFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">{translations.oceanFee}:</span>
                  <span className="font-medium">${oceanFee.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center py-0.5 font-semibold text-primary">
                  <span className="text-muted-foreground">{translations.shippingFee}:</span>
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
};
