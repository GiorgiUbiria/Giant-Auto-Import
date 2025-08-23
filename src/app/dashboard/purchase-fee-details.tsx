"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  purchaseFee: number;
  auctionFee: number;
  gateFee: number;
  titleFee: number;
  environmentalFee: number;
  virtualBidFee: number;
};

type FeeItemProps = {
  label: string;
  amount: number;
  className?: string;
};

const FeeItem = ({ label, amount, className }: FeeItemProps) => (
  <div className={cn("flex justify-between items-center py-0.5", className)}>
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium">{formatCurrency(amount)}</span>
  </div>
);

export const PurchaseFeeDetails = ({
  purchaseFee,
  auctionFee,
  gateFee,
  titleFee,
  environmentalFee,
  virtualBidFee,
}: Props) => {
  const totalPurchaseFee = 
    purchaseFee + 
    auctionFee + 
    gateFee + 
    titleFee + 
    environmentalFee + 
    virtualBidFee;

  return (
    <div className="relative group">
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="font-medium hover:text-primary/80 transition-colors">
            {formatCurrency(totalPurchaseFee)}
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Purchase Fee Breakdown</h3>
              <div className="space-y-1">
                <FeeItem label="Base Purchase Fee" amount={purchaseFee} />
                <FeeItem label="Auction Fee" amount={auctionFee} />
                <FeeItem label="Gate Fee" amount={gateFee} />
                <FeeItem label="Title Fee" amount={titleFee} />
                <FeeItem label="Environmental Fee" amount={environmentalFee} />
                <FeeItem label="Virtual Bid Fee" amount={virtualBidFee} />
                <Separator className="my-2" />
                <FeeItem 
                  label="Total Purchase Fee" 
                  amount={totalPurchaseFee}
                  className="font-semibold text-primary"
                />
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}; 