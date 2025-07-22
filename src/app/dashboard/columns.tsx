"use client";

import { ColumnDef } from "@tanstack/react-table";
import IAAILogo from "../../../public/iaai-logo.png";
import CopartLogo from "../../../public/copart-logo.png";

import Link from "next/link";
import Image from "next/image";

import CopyToClipBoard from "@/components/copy-to-clipboard";

import { selectCarSchema } from "@/lib/drizzle/schema";
import { z } from "zod";
import { TableImage } from "./table-image";
import { Reciever } from "./reciever";
import { TotalFeeDetails } from "./total-fee-details";

const SelectSchema = selectCarSchema;
type SelectSchemaType = z.infer<typeof SelectSchema>;

export const columns: ColumnDef<SelectSchemaType>[] = [
  {
    accessorKey: "purchaseDate",
    header: () => <div className="text-center font-semibold">PD</div>,
    cell: ({ row }) => {
      const purchaseDate = row.getValue("purchaseDate") as Date;

      if (!purchaseDate || (new Date(purchaseDate).getFullYear() === 1 &&
        new Date(purchaseDate).getMonth() === 0 &&
        new Date(purchaseDate).getDate() === 1)) {
        return <div className="text-center text-muted-foreground">-</div>;
      }

      const formattedDate = new Date(purchaseDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
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
  },
  {
    id: "vinDetails", 
    accessorKey: "vin",
    header: () => <div className="font-semibold">VIN# LOT#</div>,
    cell: ({ row }) => {
      const vin = row.original.vin as SelectSchemaType["vin"];
      const lotNumber = row.original.lotNumber as SelectSchemaType["lotNumber"];

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href={`/car/${vin}`} className="hover:underline text-primary font-medium">
              {vin}
            </Link>
            <CopyToClipBoard text={vin} />
          </div>
          {lotNumber ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">{lotNumber}</span>
              <CopyToClipBoard text={lotNumber} />
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
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
    accessorKey: "keys",
    header: () => <div className="text-center font-semibold">Keys</div>,
    cell: ({ row }) => {
      const keys = row.getValue("keys") as string;
      return <div className="text-center font-medium">{keys || "-"}</div>;
    }
  },
  {
    accessorKey: "title",
    header: () => <div className="text-center font-semibold">Title</div>,
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="text-center font-medium">{title || "-"}</div>;
    }
  },
  {
    accessorKey: "shippingStatus",
    header: () => <div className="text-center font-semibold">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("shippingStatus") as string;
      return (
        <div className="text-center">
          <span className={`px-2 py-1 rounded-full text-sm font-medium
            ${status === "In Transit" ? "bg-yellow-100 text-yellow-800" :
              status === "Delivered" ? "bg-green-100 text-green-800" :
                status === "Processing" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"}`}>
            {status || "Pending"}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: "departureDate",
    header: "ETD",
    cell: ({ row }) => {
      const departureDate = row.getValue("departureDate") as Date;

      if (!departureDate) {
        return <p className="text-center"> - </p>;
      }

      const date = new Date(departureDate);

      const isSpecificDate =
        date.getFullYear() === 1 &&
        date.getMonth() === 0 &&
        date.getDate() === 1;

      if (isSpecificDate) {
        return <p> - </p>;
      }

      const formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });

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

      const formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });

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
    accessorKey: "purchaseFee",
    header: "Purchase Fee",
  },
  {
    accessorKey: "shippingFee",
    header: "Shipping Fee",
  },
  {
    accessorKey: "totalFee",
    header: "Total Fee",
    cell: ({ row }) => {
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

      return (
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
          totalFee={totalFee || 0}
        />
      );
    },
  },
];
