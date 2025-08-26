"use client";

import { ColumnDef } from "@tanstack/react-table";
import CopartLogo from "../../../../public/copart-logo.png";
import IAAILogo from "../../../../public/iaai-logo.png";

import Image from "next/image";
import Link from "next/link";
import { Check, X, Download } from "lucide-react";

import CopyToClipBoard from "@/components/copy-to-clipboard";
import { Button } from "@/components/ui/button";

import { selectCarSchema } from "@/lib/drizzle/schema";
import { z } from "zod";
import { Actions } from "./actions";
import { Owner } from "./owner";
import { TableImage } from "./table-image";
import { AdminReciever } from "./admin-reciever";
import { PaymentInput } from "@/components/payment-input";
import { TotalDueDisplay } from "@/components/total-due-display";
import { InvoiceUploadModal } from "@/components/invoice-upload-modal";

const SelectSchema = selectCarSchema;
type SelectSchemaType = z.infer<typeof SelectSchema>;

// Add type for car with payment and invoice data
type CarWithDetails = SelectSchemaType & {
  // Add payment and invoice data (computed fields from API)
  paymentHistory?: any[];
  hasInvoice?: {
    PURCHASE: boolean;
    SHIPPING: boolean;
    TOTAL: boolean;
  };
};

interface ColumnsTranslations {
  columns: {
    owner: string;
    purchaseDate: string;
    photo: string;
    vehicle: string;
    lotVin: string;
    receiver: string;
    fuel: string;
    title: string;
    keys: string;
    usPort: string;
    destinationPort: string;
    actions: string;
  };
  actions: {
    edit: string;
    delete: string;
    deleteConfirmDescription: string;
    cancel: string;
    deleteAction: string;
    deleting: string;
    deleteSuccess: string;
    deleteError: string;
  };
  receiver: {
    noReceiver: string;
    assignSuccess: string;
    assignError: string;
  };
  owner: {
    loadError: string;
  };
  totalFee: {
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
  buttons: {
    comingSoon: string;
  };
  status: {
    yes: string;
    no: string;
  };
}

export const columns = (
  translations: ColumnsTranslations,
  onRefresh?: () => void
): ColumnDef<CarWithDetails>[] => [
    {
      accessorKey: "ownerId",
      header: translations.columns.owner,
      cell: ({ row }) => {
        const ownerId = row.getValue("ownerId") as SelectSchemaType["ownerId"];

        if (!ownerId || ownerId === "") {
          return <p> - </p>;
        }

        return <Owner id={ownerId} translations={translations.owner} />;
      },
    },
    {
      accessorKey: "purchaseDate",
      header: () => <div className="text-center font-semibold">{translations.columns.purchaseDate}</div>,
      cell: ({ row }) => {
        const purchaseDate = row.getValue("purchaseDate") as Date;

        if (
          !purchaseDate ||
          (new Date(purchaseDate).getFullYear() === 1 &&
            new Date(purchaseDate).getMonth() === 0 &&
            new Date(purchaseDate).getDate() === 1)
        ) {
          return <div className="text-center text-muted-foreground">-</div>;
        }

        const dateObj = new Date(purchaseDate);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });

        return <div className="text-center font-medium">{formattedDate}</div>;
      },
    },
    {
      id: "photo",
      accessorKey: "vin",
      header: () => <div className="text-center font-semibold">{translations.columns.photo}</div>,
      cell: ({ row }) => {
        const vin = row.original.vin as SelectSchemaType["vin"];
        return <TableImage vin={vin} />;
      },
      enableColumnFilter: false, // Disable filtering for photo column
      meta: { cellClassName: "p-0 relative h-[72px] !w-[154px] !min-w-[154px] !max-w-[154px] bg-red-100" }, // Force width with !important and add background for debugging
    },
    {
      accessorKey: "year",
      header: () => <div className="font-semibold">{translations.columns.vehicle}</div>,
      cell: ({ row }) => {
        const year = row.getValue("year") as SelectSchemaType["year"];
        const make = row.original.make as SelectSchemaType["make"];
        const model = row.original.model as SelectSchemaType["model"];
        const auction = row.original.auction as SelectSchemaType["auction"];

        return (
          <div className="flex flex-col items-center space-y-2 min-w-[80px]">
            <p className="font-medium">{year}</p>
            <p className="font-medium">
              {make} {model}
            </p>
            <div className="shrink-0">
              {auction !== "Copart" ? (
                <Image src={IAAILogo} alt="IAAI" className="size-8 rounded-sm" />
              ) : (
                <Image src={CopartLogo} alt="Copart" className="size-8 rounded-sm" />
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "vinDetails",
      accessorKey: "vin",
      header: () => <div className="font-semibold">{translations.columns.lotVin}</div>,
      cell: ({ row }) => {
        const vin = row.original.vin as SelectSchemaType["vin"];
        const lotNumber = row.original.lotNumber as SelectSchemaType["lotNumber"];

        return (
          <div className="space-y-1">
            {lotNumber ? (
              <div className="flex items-center gap-2">
                <span className="font-medium">{lotNumber}</span>
                <CopyToClipBoard text={lotNumber} />
              </div>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
            <div className="flex items-center gap-2">
              <Link href={`/car/${vin}`} className="hover:underline text-primary font-medium">
                {vin}
              </Link>
              <CopyToClipBoard text={vin} />
            </div>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const vin = row.original.vin;
        const lotNumber = row.original.lotNumber;
        return !!(
          vin?.toLowerCase().includes(value.toLowerCase()) ||
          lotNumber?.toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      accessorKey: "reciever",
      header: translations.columns.receiver,
      cell: ({ row }) => {
        const reciever = row.getValue("reciever") as SelectSchemaType["reciever"];
        const vin = row.original.vin as SelectSchemaType["vin"];

        return <AdminReciever reciever={reciever} vin={vin} translations={translations.receiver} />;
      },
    },
    {
      accessorKey: "fuelType",
      header: () => <div className="text-center font-semibold">{translations.columns.fuel}</div>,
      cell: ({ row }) => {
        const fuelType = row.getValue("fuelType") as string;
        return <div className="text-center font-medium">{fuelType || "-"}</div>;
      }
    },
    {
      accessorKey: "title",
      header: () => <div className="text-center font-semibold">{translations.columns.title}</div>,
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const hasTitle = title === "Yes" || title === "yes" || title === "YES";
        const noTitle = title === "No" || title === "no" || title === "NO";

        return (
          <div className="text-center flex items-center justify-center">
            {hasTitle ? (
              <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md">
                <Check className="h-4 w-4" />
                <span className="font-medium">{translations.status.yes}</span>
              </div>
            ) : noTitle ? (
              <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md">
                <X className="h-4 w-4" />
                <span className="font-medium">{translations.status.no}</span>
              </div>
            ) : (
              <span className="text-muted-foreground font-medium">{title || "-"}</span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "keys",
      header: () => <div className="text-center font-semibold">{translations.columns.keys}</div>,
      cell: ({ row }) => {
        const keys = row.getValue("keys") as string;
        const hasKeys = keys === "Yes" || keys === "yes" || keys === "YES";
        const noKeys = keys === "No" || keys === "no" || keys === "NO";

        return (
          <div className="text-center flex items-center justify-center">
            {hasKeys ? (
              <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md">
                <Check className="h-4 w-4" />
                <span className="font-medium">{translations.status.yes}</span>
              </div>
            ) : noKeys ? (
              <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md">
                <X className="h-4 w-4" />
                <span className="font-medium">{translations.status.no}</span>
              </div>
            ) : (
              <span className="text-muted-foreground font-medium">{keys || "-"}</span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "originPort",
      header: translations.columns.usPort,
      cell: ({ row }) => {
        const originPort = row.getValue("originPort") as string;
        return <div className="font-medium">{originPort || "-"}</div>;
      },
    },
    {
      accessorKey: "destinationPort",
      header: translations.columns.destinationPort,
      cell: ({ row }) => {
        const destinationPort = row.getValue("destinationPort") as string;
        const displayPort = destinationPort ? `Georgia, ${destinationPort}` : "-";
        return <div className="font-medium">{displayPort || "-"}</div>;
      },
    },
    {
      accessorKey: "purchaseDue",
      header: () => <div className="text-center font-semibold">Purchase Due</div>,
      cell: ({ row }) => {
        const purchaseDue = row.original.purchaseDue as SelectSchemaType["purchaseDue"];
        const purchaseFee = row.original.purchaseFee as SelectSchemaType["purchaseFee"];
        const auctionFee = row.original.auctionFee as SelectSchemaType["auctionFee"];
        const gateFee = row.original.gateFee as SelectSchemaType["gateFee"];
        const titleFee = row.original.titleFee as SelectSchemaType["titleFee"];
        const environmentalFee = row.original.environmentalFee as SelectSchemaType["environmentalFee"];
        const virtualBidFee = row.original.virtualBidFee as SelectSchemaType["virtualBidFee"];

        const initialAmount = (purchaseFee || 0) + (auctionFee || 0) + (gateFee || 0) + (titleFee || 0) + (environmentalFee || 0) + (virtualBidFee || 0);

        return (
          <div className="text-center">
            <PaymentInput
              carVin={row.original.vin as string}
              currentAmount={purchaseDue || 0}
              paymentType="PURCHASE"
              initialAmount={initialAmount}
              paymentHistory={row.original.paymentHistory || []}
              hasInvoice={row.original.hasInvoice?.PURCHASE || false}
              onPaymentAdded={() => {
                // Trigger table refresh using the provided refresh function
                onRefresh?.();
              }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "shippingDue",
      header: () => <div className="text-center font-semibold">Shipping Due</div>,
      cell: ({ row }) => {
        const shippingDue = row.original.shippingDue as SelectSchemaType["shippingDue"];
        const shippingFee = row.original.shippingFee as SelectSchemaType["shippingFee"];
        const groundFee = row.original.groundFee as SelectSchemaType["groundFee"];
        const oceanFee = row.original.oceanFee as SelectSchemaType["oceanFee"];

        const initialAmount = (shippingFee || 0) + (groundFee || 0) + (oceanFee || 0);

        return (
          <div className="text-center">
            <PaymentInput
              carVin={row.original.vin as string}
              currentAmount={shippingDue || 0}
              paymentType="SHIPPING"
              initialAmount={initialAmount}
              paymentHistory={row.original.paymentHistory || []}
              hasInvoice={row.original.hasInvoice?.SHIPPING || false}
              onPaymentAdded={() => {
                // Trigger table refresh using the provided refresh function
                onRefresh?.();
              }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "totalDue",
      header: () => <div className="text-center font-semibold">Total Due</div>,
      cell: ({ row }) => {
        const totalDue = row.original.totalDue as SelectSchemaType["totalDue"];
        const paidAmount = row.original.paidAmount as SelectSchemaType["paidAmount"];

        return (
          <div className="text-center">
            <TotalDueDisplay
              carVin={row.original.vin as string}
              totalDue={totalDue || 0}
              paidAmount={paidAmount || 0}
              paymentHistory={row.original.paymentHistory || []}
              hasInvoice={row.original.hasInvoice?.TOTAL || false}
              onRefresh={() => {
                // Trigger table refresh using the provided refresh function
                onRefresh?.();
              }}
            />
          </div>
        );
      },
    },
    {
      id: "actions",
      header: translations.columns.actions,
      cell: ({ row }) => {
        return <Actions vin={row.original.vin as string} translations={translations.actions} />;
      },
      enableColumnFilter: false,
    },
  ];
