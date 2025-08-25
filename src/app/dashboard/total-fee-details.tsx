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
  shippingFee: number;
  groundFee: number;
  oceanFee: number;
  totalFee: number;
  insurance?: "YES" | "NO";
  currentDue: number;
  paidAmount: number;
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
  currentDue,
  paidAmount,
}: Props) => {
  const totalPurchaseFee =
    purchaseFee +
    auctionFee +
    gateFee +
    titleFee +
    environmentalFee +
    virtualBidFee;

  const totalShippingFee = shippingFee + groundFee + oceanFee;
  const isFullyPaid = currentDue <= 0;

  return (
    <div className="relative group">
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className={cn(
            "font-medium hover:text-primary/80 transition-colors",
            isFullyPaid ? "text-green-600" : "text-red-600"
          )}>
            {formatCurrency(currentDue)}
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Purchase Details</h3>
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

            <div>
              <h3 className="font-semibold text-lg mb-2">Shipping Details</h3>
              <div className="space-y-1">
                <FeeItem label="Ground Fee" amount={groundFee} />
                <FeeItem label="Ocean Fee" amount={oceanFee} />
                <Separator className="my-2" />
                <FeeItem
                  label="Total Shipping Fee"
                  amount={totalShippingFee}
                  className="font-semibold text-primary"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Payment Summary</h3>
              <div className="space-y-1">
                <FeeItem
                  label="Total Fee"
                  amount={totalFee}
                  className="font-semibold text-primary"
                />
                <FeeItem
                  label="Total Paid"
                  amount={paidAmount}
                  className="text-green-600 font-medium"
                />
                <Separator className="my-2" />
                <FeeItem
                  label="Remaining Due"
                  amount={currentDue}
                  className={cn(
                    "font-semibold",
                    isFullyPaid ? "text-green-600" : "text-red-600"
                  )}
                />
              </div>
            </div>

            {insurance && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Insurance</h3>
                <div className="space-y-1">
                  <FeeItem
                    label="Insurance Status"
                    amount={0}
                    className="font-medium"
                  />
                  <span className="text-sm text-muted-foreground">
                    {insurance === "YES" ? "Insurance Included" : "No Insurance"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
