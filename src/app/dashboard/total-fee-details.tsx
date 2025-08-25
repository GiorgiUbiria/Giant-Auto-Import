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
  shippingFee: number;
  groundFee: number;
  oceanFee: number;
  totalFee: number;
  insurance?: "YES" | "NO";
  currentDue: number;
  paidAmount: number;
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
  carVin,
  hasInvoice,
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

  const { execute: executeDownloadInvoice } = useServerAction(getInvoiceDownloadUrlAction, {
    onSuccess: (response) => {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = response.data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Invoice download started");
    },
    onError: (error) => {
      console.error("Download error:", error);
      toast.error("Failed to download invoice");
    },
  });

  const handleDownloadInvoice = async () => {
    try {
      await executeDownloadInvoice({ carVin, invoiceType: "TOTAL" });
    } catch (error) {
      console.error("Download error in handleDownloadInvoice:", error);
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

            {hasInvoice && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Invoice</h3>
                <div className="space-y-1">
                  <FeeItem
                    label="Invoice Available"
                    amount={0}
                    className="font-medium"
                  />
                  <Button
                    onClick={handleDownloadInvoice}
                    className="flex items-center gap-2"
                    disabled={false} // No loading state for this action
                  >
                    <Download size={16} />
                    Download Invoice
                  </Button>
                </div>
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
            Download Total Invoice
          </Button>
        </div>
      )}
    </div>
  );
};
