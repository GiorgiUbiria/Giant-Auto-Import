"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import IAAILogo from "../../../../public/iaai-logo.png";
import CopartLogo from "../../../../public/copart-logo.png";

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CopyToClipBoard from "@/components/copy-to-clipboard";

import { selectCarSchema } from "@/lib/drizzle/schema";
import { z } from "zod";

const SelectSchema = selectCarSchema.omit({ bodyType: true, destinationPort: true, createdAt: true, });
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
  // {
  //   accessorKey: "images",
  //   id: "images",
  //   header: "Photo",
  //   cell: ({ row }) => {
  //     const images = row.getValue("images") as ImageType[];
  //     if (!images || images.length === 0) {
  //       return (
  //         <div className="w-[128px] flex justify-center ml-8">
  //           <div className="bg-gray-300 rounded-md size-16 w-full"></div>
  //         </div>
  //       );
  //     }
  //     return (
  //       <div className="w-full flex justify-center">
  //         <Image
  //           alt="Product image"
  //           className="w-full h-[92px] aspect-square rounded-md object-cover"
  //           height="300"
  //           src={images[0]?.imageUrl!}
  //           width="300"
  //         />
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "vin",
    header: "VIN#",
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
    cell: ({ row }) => {
      const vin = row.getValue("vin") as string;
      return (
        <Link href={`/admin/edit/${vin}`} className="hover:text-blue-500 hover:underline">Edit Car</Link>
      );
    },
  },
];
