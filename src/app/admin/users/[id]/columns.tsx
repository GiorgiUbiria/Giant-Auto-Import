"use client";

import { ColumnDef } from "@tanstack/react-table";
import IAAILogo from "../../../../../public/iaai-logo.png";
import CopartLogo from "../../../../../public/copart-logo.png";

import Link from "next/link";
import Image from "next/image";

import CopyToClipBoard from "@/components/copy-to-clipboard";

import { selectCarSchema } from "@/lib/drizzle/schema";
import { z } from "zod";
import { Actions } from "./actions";
import { TableImage } from "./table-image";
import { AdminHolder } from "./admin-holder";

const SelectSchema = selectCarSchema;
type SelectSchemaType = z.infer<typeof SelectSchema>;

export const columns: ColumnDef<SelectSchemaType>[] = [
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
        <div className="flex items-center justify-between w-[84px]">
          <p className="text-left"> {year + " " + make + " " + model} </p>
          {auction !== "Copart" ? <Image src={IAAILogo} alt="IAAI" className="size-8" /> : <Image src={CopartLogo} alt="IAAI" className="size-8" />}
        </div>
      )
    },
  },
  {
    accessorKey: "holder",
    header: "Holder",
    cell: ({ row }) => {
      const holder = row.getValue("holder") as SelectSchemaType["holder"];
      const vin = row.getValue("vin") as SelectSchemaType["vin"];

      return (
        <AdminHolder holder={holder} vin={vin} />
      )
    },
  },
  {
    accessorKey: "fuelType",
    header: "Fuel",
  },
  {
    accessorKey: "keys",
    header: "Keys",
  },
  {
    accessorKey: "title",
    header: "Title",
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
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <Actions vin={row.getValue("vin") as string} />
    },
  },
];
