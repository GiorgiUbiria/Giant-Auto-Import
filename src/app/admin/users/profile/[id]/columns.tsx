"use client";

import { ColumnDef } from "@tanstack/react-table";
import IAAILogo from "../../../../../../public/iaai-logo.png";
import CopartLogo from "../../../../../../public/copart-logo.png";

import Link from "next/link";
import Image from "next/image";

import CopyToClipBoard from "@/components/copy-to-clipboard";

import { selectCarSchema } from "@/lib/drizzle/schema";
import { z } from "zod";
import { Actions } from "./actions";
import { TableImage } from "./table-image";
import { AdminReciever } from "./admin-reciever";
import { TotalFeeDetails } from "../../../../dashboard/total-fee-details";
import { PurchaseFeeDetails } from "../../../../dashboard/purchase-fee-details";
import { ShippingFeeDetails } from "../../../../dashboard/shipping-fee-details";
import { PaymentInput } from "@/components/payment-input";

const SelectSchema = selectCarSchema;
type SelectSchemaType = z.infer<typeof SelectSchema>;

// Extended type to include API-added properties
type CarWithDetails = SelectSchemaType & {
  paymentHistory?: any[];
  hasInvoice?: {
    PURCHASE: boolean;
    SHIPPING: boolean;
    TOTAL: boolean;
  };
};

export const columns = (onRefresh?: () => void): ColumnDef<CarWithDetails>[] => [
  {
    accessorKey: "purchaseDate",
    header: "PD",
    cell: ({ row }) => {
      const purchaseDate = row.getValue("purchaseDate") as Date;

      if (!purchaseDate) {
        return <p> - </p>;
      }

      const date = new Date(purchaseDate);

      const isSpecificDate =
        date.getFullYear() === 1 &&
        date.getMonth() === 0 &&
        date.getDate() === 1;

      if (isSpecificDate) {
        return <p> - </p>;
      }

      const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
      })

      return <p> {formattedDate} </p>;
    }
  },
  {
    header: "Photo",
    cell: ({ row }) => {
      const vin = row.original.vin as SelectSchemaType["vin"];

      return (
        <TableImage vin={vin} />
      )
    }
  },
  {
    accessorKey: "vin",
    header: "VIN#",
    cell: ({ row }) => {
      const vin = row.getValue("vin") as SelectSchemaType["vin"];

      return (
        <div className="flex gap-2 items-center">
          <Link href={`/car/${vin}`}> {vin} </Link>
          <CopyToClipBoard text={vin} />
        </div>
      )
    },
  },
  {
    accessorKey: "year",
    header: "Vehicle",
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
      )
    },
  },
  {
    accessorKey: "reciever",
    header: "Reciever",
    cell: ({ row }) => {
      const reciever = row.getValue("reciever") as SelectSchemaType["reciever"];
      const vin = row.getValue("vin") as SelectSchemaType["vin"];

      return (
        <AdminReciever reciever={reciever} vin={vin} />
      )
    },
  },
  {
    accessorKey: "fuelType",
    header: "Fuel",
    cell: ({ row }) => {
      const fuelType = row.getValue("fuelType") as string;

      if (!fuelType) return <div className="text-center text-muted-foreground">-</div>;

      const getFuelInitials = (type: string) => {
        switch (type.toUpperCase()) {
          case 'GASOLINE':
            return 'GAS';
          case 'HYBRID_ELECTRIC':
            return 'HYB';
          case 'DIESEL':
            return 'DIE';
          case 'ELECTRIC':
            return 'ELE';
          case 'HYDROGEN':
            return 'HYD';
          default:
            return type.substring(0, 3).toUpperCase();
        }
      };

      return (
        <div className="text-center flex items-center justify-center">
          <span className="text-sm font-medium">{getFuelInitials(fuelType)}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "keys",
    header: "Keys",
    cell: ({ row }) => {
      const keys = row.getValue("keys") as string;
      const hasKeys = keys === "Yes" || keys === "yes" || keys === "YES";
      const noKeys = keys === "No" || keys === "no" || keys === "NO";

      return (
        <div className="text-center flex items-center justify-center">
          {hasKeys ? (
            <span className="text-green-600 text-xl font-bold">✓</span>
          ) : noKeys ? (
            <span className="text-red-600 text-xl font-bold">✗</span>
          ) : (
            <span className="text-muted-foreground font-medium">{keys || "-"}</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const hasTitle = title === "Yes" || title === "yes" || title === "YES";
      const noTitle = title === "No" || title === "no" || title === "NO";

      return (
        <div className="text-center flex items-center justify-center">
          {hasTitle ? (
            <span className="text-green-600 text-xl font-bold">✓</span>
          ) : noTitle ? (
            <span className="text-red-600 text-xl font-bold">✗</span>
          ) : (
            <span className="text-muted-foreground font-medium">{title || "-"}</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "shippingStatus",
    header: "Status",
  },
  {
    accessorKey: "departureDate",
    header: "ETD",
    cell: ({ row }) => {
      const departureDate = row.getValue("departureDate") as Date;

      if (!departureDate) {
        return <p className="text-center"> - </p>;
      }

      const date = new Date(departureDate)

      const isSpecificDate =
        date.getFullYear() === 1 &&
        date.getMonth() === 0 &&
        date.getDate() === 1;

      if (isSpecificDate) {
        return <p> - </p>;
      }

      const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
      })

      return <p> {formattedDate} </p>;
    },
  },
  {
    accessorKey: "arrivalDate",
    header: "ETA",
    cell: ({ row }) => {
      const arrivalDate = row.getValue("arrivalDate") as Date;

      if (!arrivalDate) {
        return <p> - </p>;
      }

      const date = new Date(arrivalDate);

      const isSpecificDate =
        date.getFullYear() === 1 &&
        date.getMonth() === 0 &&
        date.getDate() === 1;

      if (isSpecificDate) {
        return <p> - </p>;
      }

      const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
      })

      return <p> {formattedDate} </p>;
    },
  },
  {
    accessorKey: "originPort",
    header: "Origin Port",
  },
  {
    accessorKey: "destinationPort",
    header: "Destination Port",
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
    accessorKey: "totalFee",
    header: "Total Fee",
    cell: ({ row }) => {
      const purchaseFee = row.original.purchaseFee as SelectSchemaType["purchaseFee"];
      const auctionFee = row.original.auctionFee as SelectSchemaType["auctionFee"];
      const gateFee = row.original.gateFee as SelectSchemaType["gateFee"];
      const titleFee = row.original.titleFee as SelectSchemaType["titleFee"];
      const environmentalFee = row.original.environmentalFee as SelectSchemaType["environmentalFee"];
      const virtualBidFee = row.original.virtualBidFee as SelectSchemaType["virtualBidFee"];
      const shippingFee = row.original.shippingFee as SelectSchemaType["shippingFee"];
      const groundFee = row.original.groundFee as SelectSchemaType["groundFee"];
      const oceanFee = row.original.oceanFee as SelectSchemaType["oceanFee"];
      const totalFee = row.original.totalFee as SelectSchemaType["totalFee"];
      const totalDue = row.original.totalDue as SelectSchemaType["totalDue"];
      const paidAmount = row.original.paidAmount as SelectSchemaType["paidAmount"];

      // Calculate current due amount, fallback to total fee if totalDue is not set
      const currentDue = totalDue || totalFee || 0;

      return <TotalFeeDetails
        purchaseFee={purchaseFee || 0}
        auctionFee={auctionFee || 0}
        gateFee={gateFee || 0}
        titleFee={titleFee || 0}
        environmentalFee={environmentalFee || 0}
        virtualBidFee={virtualBidFee || 0}
        shippingFee={shippingFee || 0}
        groundFee={groundFee || 0}
        oceanFee={oceanFee || 0}
        totalFee={totalFee || 0}
        insurance={row.original.insurance as SelectSchemaType["insurance"]}
        currentDue={currentDue}
        paidAmount={paidAmount || 0}
        carVin={row.original.vin}
        hasInvoice={false} // Default to false for admin users view
      />;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <Actions vin={row.getValue("vin") as string} />
    },
  },
];
