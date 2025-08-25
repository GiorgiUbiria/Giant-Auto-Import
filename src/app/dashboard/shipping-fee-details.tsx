"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  shippingFee: number;
  groundFee: number;
  oceanFee: number;
  currentDue: number;
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

export const ShippingFeeDetails = ({
  shippingFee,
  groundFee,
  oceanFee,
  currentDue,
}: Props) => {
  const totalShippingFee = shippingFee + groundFee + oceanFee;
  const totalPaid = totalShippingFee - currentDue;
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
              <h3 className="font-semibold text-lg mb-2">Shipping Fee Breakdown</h3>
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
              <h3 className="font-semibold text-lg mb-2">Payment Status</h3>
              <div className="space-y-1">
                <FeeItem
                  label="Total Paid"
                  amount={totalPaid}
                  className="text-green-600 font-medium"
                />
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
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}; 