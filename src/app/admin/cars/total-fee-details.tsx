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
  translations,
}: Props) => {
  return (
    <div>
      <HoverCard>
        <HoverCardTrigger>
          <p className="hover:text-primary/50 transition-all">{totalFee}</p>
        </HoverCardTrigger>
        <HoverCardContent>
          <div>
            <h3 className="font-bold mb-2">
              {translations.totalPurchaseFee}{" "}
              {purchaseFee +
                auctionFee +
                gateFee +
                titleFee +
                environmentalFee +
                virtualBidFee}
              $
            </h3>
            <ul className="list-none pl-4 mb-4">
              <li>{translations.basePurchaseFee} {purchaseFee}$</li>
              <li>{translations.auctionFee} {auctionFee}$</li>
              <li>{translations.gateFee} {gateFee}$</li>
              <li>{translations.titleFee} {titleFee}$</li>
              <li>{translations.environmentalFee} {environmentalFee}$</li>
              <li>{translations.virtualBidFee} {virtualBidFee}$</li>
            </ul>
            <p className="font-semibold text-sm pl-4">
              {translations.totalPurchaseFeeResult} {purchaseFee}$
            </p>
            <Separator className="my-2" />
            <h3 className="font-bold mb-2">{translations.shippingFee} {shippingFee}$</h3>
            <ul className="list-none pl-4">
              <li>{translations.groundFee} {groundFee}$</li>
              <li>{translations.oceanFee} {oceanFee}$</li>
            </ul>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
