"use client";

import { ColumnDef } from "@tanstack/react-table";
import CopartLogo from "../../../../public/copart-logo.png";
import IAAILogo from "../../../../public/iaai-logo.png";

import Image from "next/image";
import Link from "next/link";

import CopyToClipBoard from "@/components/copy-to-clipboard";

import { selectCarSchema } from "@/lib/drizzle/schema";
import { z } from "zod";
import { Actions } from "./actions";
import { Owner } from "./owner";
import { TableImage } from "./table-image";
import { AdminReciever } from "./admin-reciever";

const SelectSchema = selectCarSchema;
type SelectSchemaType = z.infer<typeof SelectSchema>;

export const columns: ColumnDef<SelectSchemaType>[] = [
  {
    accessorKey: "ownerId",
    header: "Owner",
    cell: ({ row }) => {
      const ownerId = row.getValue("ownerId") as SelectSchemaType["ownerId"];

      if (!ownerId || ownerId === "") {
        return <p> - </p>;
      }

      return <Owner id={ownerId} />;
    }
  },
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
    header: "VIN# LOT#",
    cell: ({ row }) => {
      const vin = row.getValue("vin") as SelectSchemaType["vin"];
      const lotNumber = row.original.lotNumber as SelectSchemaType["lotNumber"];

      return (
        <div>
          <div className="flex gap-x-2 items-center">
            <Link href={`/car/${vin}`} className="hover:underline"> {vin} </Link>
            <CopyToClipBoard text={vin} />
          </div>
          {lotNumber ? (
            <div className="flex gap-x-2 items-center">
              <p> {lotNumber}</p>
              <CopyToClipBoard text={lotNumber} />
            </div>
          ) : (
            <p> - </p>
          )}
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
          <div className="flex flex-col gap-0.5">
            <p className="text-left"> {year} </p>
            <p className="text-left"> {make} </p>
            <p className="text-left"> {model} </p>
            {auction !== "Copart" ? <Image src={IAAILogo} alt="IAAI" className="size-8" /> : <Image src={CopartLogo} alt="IAAI" className="size-8" />}
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
