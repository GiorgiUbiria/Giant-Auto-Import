"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useServerAction } from "zsa-react";
import { getInvoiceDownloadUrlAction } from "@/lib/actions/invoiceActions";
import { toast } from "sonner";

type Props = {
  purchaseFee: number;
  auctionFee: number;
  gateFee: number;
  titleFee: number;
  environmentalFee: number;
  virtualBidFee: number;
  currentDue: number;
  carVin: string;
  hasInvoice?: boolean;
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
  currentDue,
  carVin,
  hasInvoice,
}: Props) => {
  const totalPurchaseFee =
    purchaseFee +
    auctionFee +
    auctionFee +
    gateFee +
    titleFee +
    environmentalFee +
    virtualBidFee;

  const totalPaid = totalPurchaseFee - currentDue;
  const isFullyPaid = currentDue <= 0;

  const handleDownloadInvoice = async () => {
    try {
      const [result, error] = await getInvoiceDownloadUrlAction({
        carVin,
        invoiceType: "PURCHASE",
      });

      if (error) {
        throw error;
      }

      // Open in new tab instead of downloading
      window.open(result.downloadUrl, '_blank');
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download invoice");
    }
  };



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

            {hasInvoice && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Invoice</h3>
                <Button
                  onClick={handleDownloadInvoice}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Download button displayed under the price when invoice exists */}
      {hasInvoice && (
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadInvoice}
            className="text-xs px-2 py-1 h-6"
          >
            <Download className="h-3 w-3 mr-1" />
            Download Invoice
          </Button>
        </div>
      )}
    </div>
  );
}; 