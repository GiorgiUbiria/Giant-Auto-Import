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
export type SelectSchemaType = z.infer<typeof SelectSchema>;

// Add type for car with invoice data
export type CarWithInvoiceData = SelectSchemaType & {
  hasInvoice?: {
    PURCHASE: boolean;
    SHIPPING: boolean;
    TOTAL: boolean;
  };
};

export const columns: ColumnDef<CarWithInvoiceData>[] = [
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

      if (!fuelType) return <div className="text-center text-muted-foreground">-</div>;

      const getFuelIcon = (type: string) => {
        switch (type.toUpperCase()) {
          case 'GASOLINE':
            return (
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24" aria-labelledby="gasolineTitle">
                <title id="gasolineTitle">Gasoline</title>
                <path d="M18 10h-1V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v6H6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM9 4h6v6H9V4z" />
              </svg>
            );
          case 'HYBRID_ELECTRIC':
            return (
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24" aria-labelledby="hybridElectricTitle">
                <title id="hybridElectricTitle">Hybrid Electric</title>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17V7h2v7.17l3.59-3.58L17 10l-5 5z" />
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
              </svg>
            );
          case 'DIESEL':
            return (
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-labelledby="dieselTitle">
                <title id="dieselTitle">Diesel</title>
                <path d="M18 10h-1V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v6H6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM9 4h6v6H9V4z" />
                <text x="12" y="16" textAnchor="middle" className="text-xs font-bold fill-current">D</text>
              </svg>
            );
          case 'ELECTRIC':
            return (
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24" aria-labelledby="electricTitle">
                <title id="electricTitle">Electric</title>
                <path d="M7 2v11h3v9l7-12h-4l4-8z" />
              </svg>
            );
          case 'HYDROGEN':
            return (
              <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 24 24" aria-labelledby="hydrogenTitle">
                <title id="hydrogenTitle">Hydrogen</title>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                <text x="12" y="16" textAnchor="middle" className="text-xs font-bold fill-current">H₂</text>
              </svg>
            );
          default:
            return <span className="text-sm text-muted-foreground">{fuelType}</span>;
        }
      };

      return (
        <div className="text-center flex items-center justify-center">
          {getFuelIcon(fuelType)}
        </div>
      );
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
    accessorKey: "keys",
    header: () => <div className="text-center font-semibold">Keys</div>,
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
            carVin={row.original.vin}
            hasInvoice={row.original.hasInvoice?.PURCHASE}
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
            carVin={row.original.vin}
            hasInvoice={row.original.hasInvoice?.SHIPPING}
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
            carVin={row.original.vin}
            hasInvoice={row.original.hasInvoice?.TOTAL}
          />
        </div>
      );
    },
  },
];
