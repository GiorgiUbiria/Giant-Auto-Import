"use client";

import { ColumnDef } from "@tanstack/react-table";
import IAAILogo from "../../../public/iaai-logo.png";
import CopartLogo from "../../../public/copart-logo.png";

import Link from "next/link";
import Image from "next/image";
import { Check, X, Download } from "lucide-react";

import CopyToClipBoard from "@/components/copy-to-clipboard";
import { Button } from "@/components/ui/button";

import { selectCarSchema } from "@/lib/drizzle/schema";
import { z } from "zod";
import { TableImage } from "./table-image";
import { Reciever } from "./reciever";
import { TotalFeeDetails } from "./total-fee-details";
import { PurchaseFeeDetails } from "./purchase-fee-details";
import { ShippingFeeDetails } from "./shipping-fee-details";

const SelectSchema = selectCarSchema;
type SelectSchemaType = z.infer<typeof SelectSchema>;

export const columns: ColumnDef<SelectSchemaType>[] = [
  {
    accessorKey: "purchaseDate",
    header: () => <div className="text-center font-semibold">Purchase Date</div>,
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
    header: () => <div className="text-center font-semibold">Photo</div>,
    cell: ({ row }) => {
      const vin = row.original.vin as SelectSchemaType["vin"];
      return <TableImage vin={vin} />;
    },
    enableColumnFilter: false, // Disable filtering for photo column
    meta: { cellClassName: "p-0 relative h-[72px] !w-[154px] !min-w-[154px] !max-w-[154px] bg-red-100" }, // Force width with !important and add background for debugging
  },
  {
    accessorKey: "year",
    header: () => <div className="font-semibold">Vehicle</div>,
    cell: ({ row }) => {
      const year = row.getValue("year") as SelectSchemaType["year"];
      const make = row.original.make as SelectSchemaType["make"];
      const model = row.original.model as SelectSchemaType["model"];
      const auction = row.original.auction as SelectSchemaType["auction"];

      return (
        <div className="flex items-center justify-between min-w-[120px]">
          <p className="font-medium">
            {year} {make} {model}
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
    header: () => <div className="font-semibold">LOT# VIN#</div>,
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
    header: "Reciever",
    cell: ({ row }) => {
      const reciever = row.getValue("reciever") as SelectSchemaType["reciever"];
      const vin = row.original.vin as SelectSchemaType["vin"];

      return <Reciever reciever={reciever} vin={vin} />;
    },
  },
  {
    accessorKey: "fuelType",
    header: () => <div className="text-center font-semibold">Fuel</div>,
    cell: ({ row }) => {
      const fuelType = row.getValue("fuelType") as string;
      return <div className="text-center font-medium">{fuelType || "-"}</div>;
    }
  },
  {
    accessorKey: "title",
    header: () => <div className="text-center font-semibold">Title</div>,
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const hasTitle = title === "Yes" || title === "yes" || title === "YES";
      const noTitle = title === "No" || title === "no" || title === "NO";

      return (
        <div className="text-center flex items-center justify-center">
          {hasTitle ? (
            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md">
              <Check className="h-4 w-4" />
              <span className="font-medium">Yes</span>
            </div>
          ) : noTitle ? (
            <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md">
              <X className="h-4 w-4" />
              <span className="font-medium">No</span>
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
    header: () => <div className="text-center font-semibold">Keys</div>,
    cell: ({ row }) => {
      const keys = row.getValue("keys") as string;
      const hasKeys = keys === "Yes" || keys === "yes" || keys === "YES";
      const noKeys = keys === "No" || keys === "no" || keys === "NO";

      return (
        <div className="text-center flex items-center justify-center">
          {hasKeys ? (
            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md">
              <Check className="h-4 w-4" />
              <span className="font-medium">Yes</span>
            </div>
          ) : noKeys ? (
            <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md">
              <X className="h-4 w-4" />
              <span className="font-medium">No</span>
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
    header: "US Port",
    cell: ({ row }) => {
      const originPort = row.getValue("originPort") as string;
      return <div className="font-medium">{originPort || "-"}</div>;
    },
  },
  {
    accessorKey: "destinationPort",
    header: "Destination Port",
    cell: ({ row }) => {
      const destinationPort = row.getValue("destinationPort") as string;
      const displayPort = destinationPort ? `Georgia, ${destinationPort}` : "-";
      return <div className="font-medium">{displayPort}</div>;
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const dueDate = row.original.dueDate as SelectSchemaType["dueDate"];

      if (!dueDate) {
        return <div className="text-center text-muted-foreground">-</div>;
      }

      const dateObj = new Date(dueDate);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      const isOverdue = new Date() > dateObj;
      const isDueSoon = new Date() > new Date(dateObj.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before

      return (
        <div className="text-center space-y-1">
          <div className={`font-medium ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-green-600'}`}>
            {formattedDate}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "purchaseDue",
    header: "Purchase Due",
    cell: ({ row }) => {
      const purchaseDue = row.original.purchaseDue as SelectSchemaType["purchaseDue"];
      const purchaseFee = row.original.purchaseFee as SelectSchemaType["purchaseFee"];
      const auctionFee = row.original.auctionFee as SelectSchemaType["auctionFee"];
      const gateFee = row.original.gateFee as SelectSchemaType["gateFee"];
      const titleFee = row.original.titleFee as SelectSchemaType["titleFee"];
      const environmentalFee = row.original.environmentalFee as SelectSchemaType["environmentalFee"];
      const virtualBidFee = row.original.virtualBidFee as SelectSchemaType["virtualBidFee"];

      return (
        <div className="space-y-2">
          <PurchaseFeeDetails
            purchaseFee={purchaseFee || 0}
            auctionFee={auctionFee || 0}
            gateFee={gateFee || 0}
            titleFee={titleFee || 0}
            environmentalFee={environmentalFee || 0}
            virtualBidFee={virtualBidFee || 0}
            currentDue={purchaseDue || 0}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "shippingDue",
    header: "Shipping Due",
    cell: ({ row }) => {
      const shippingDue = row.original.shippingDue as SelectSchemaType["shippingDue"];
      const shippingFee = row.original.shippingFee as SelectSchemaType["shippingFee"];
      const groundFee = row.original.groundFee as SelectSchemaType["groundFee"];
      const oceanFee = row.original.oceanFee as SelectSchemaType["oceanFee"];

      return (
        <div className="space-y-2">
          <ShippingFeeDetails
            shippingFee={shippingFee || 0}
            groundFee={groundFee || 0}
            oceanFee={oceanFee || 0}
            currentDue={shippingDue || 0}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "totalDue",
    header: "Total Due",
    cell: ({ row }) => {
      const totalDue = row.original.totalDue as SelectSchemaType["totalDue"];
      const paidAmount = row.original.paidAmount as SelectSchemaType["paidAmount"];
      const purchaseFee = row.original
        .purchaseFee as SelectSchemaType["purchaseFee"];
      const auctionFee = row.original
        .auctionFee as SelectSchemaType["auctionFee"];
      const gateFee = row.original.gateFee as SelectSchemaType["gateFee"];
      const titleFee = row.original.titleFee as SelectSchemaType["titleFee"];
      const environmentalFee = row.original
        .environmentalFee as SelectSchemaType["environmentalFee"];
      const virtualBidFee = row.original
        .virtualBidFee as SelectSchemaType["virtualBidFee"];
      const shippingFee = row.original
        .shippingFee as SelectSchemaType["shippingFee"];
      const groundFee = row.original.groundFee as SelectSchemaType["groundFee"];
      const oceanFee = row.original.oceanFee as SelectSchemaType["oceanFee"];
      const totalFee = row.original.totalFee as SelectSchemaType["totalFee"];
      const insurance = row.original.insurance as SelectSchemaType["insurance"];

      return (
        <div className="space-y-2">
          <TotalFeeDetails
            purchaseFee={purchaseFee}
            auctionFee={auctionFee || 0}
            gateFee={gateFee || 0}
            titleFee={titleFee || 0}
            environmentalFee={environmentalFee || 0}
            virtualBidFee={virtualBidFee || 0}
            shippingFee={shippingFee || 0}
            groundFee={groundFee || 0}
            oceanFee={oceanFee || 0}
            totalFee={Math.round(totalFee || 0)}
            insurance={insurance}
            currentDue={totalDue || 0}
            paidAmount={paidAmount || 0}
          />
        </div>
      );
    },
  },
];
