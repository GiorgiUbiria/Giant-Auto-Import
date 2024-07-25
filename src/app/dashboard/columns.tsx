"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Image as ImageType } from "../../lib/interfaces";

import Link from "next/link";
import { CarData } from "@/lib/interfaces";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function getColumns(
  pdfToken: string,
  userId: string,
): ColumnDef<CarData>[] {
  return [
  {
    accessorKey: "images",
    id: "images",
    header: "",
    cell: ({ row }) => {
      const images = row.getValue("images") as ImageType[];
      if (!images || images.length === 0) {
        return (
          <div className="w-[128px] flex justify-center ml-8">
            <div className="bg-gray-300 rounded-md size-16 w-full"></div>
          </div>
        );
      }
      return (
        <div className="w-[128px] flex justify-center ml-8">
          <Image
            alt="Product image"
            className="w-full aspect-square rounded-md object-cover"
            height="300"
            src={images[0]?.imageUrl!}
            width="300"
          />
        </div>
      );
    },
  },
    {
      accessorKey: "specifications.vin",
      header: "Vin",
      id: "vin",
      cell: ({ row }) => {
        const vin = row.getValue("vin") as string;
        return <Link href={`/car/${vin}`}>{vin}</Link>;
      },
    },
    {
      accessorKey: "specifications.year",
      id: "year",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Year
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const year = row.getValue("year") as string;
        return <p className="text-center"> {year} </p>;
      },
    },
    {
      accessorKey: "specifications.make",
      header: "Make",
    },
    {
      accessorKey: "specifications.model",
      header: "Model",
    },
    {
      accessorKey: "specifications.bodyType",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <p> Vehicle Type </p>
          </div>
        );
      },
    },
    {
      accessorKey: "parking_details.status",
      header: "Status",
    },
  {
    accessorKey: "car.departureDate",
    id: "departureDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Departure Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
        return <p className="text-center"> - </p>;
      }

      const formattedDate = date.toLocaleDateString();

      return <p className="text-center"> {formattedDate} </p>;
    },
  },
  {
    accessorKey: "car.arrivalDate",
    id: "arrivalDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Arrival Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const arrivalDate = row.getValue("arrivalDate") as Date;

      if (!arrivalDate) {
        return <p className="text-center"> - </p>;
      }

      const date = new Date(arrivalDate);

      const isSpecificDate =
        date.getFullYear() === 1 &&
        date.getMonth() === 0 &&
        date.getDate() === 1;

      if (isSpecificDate) {
        return <p className="text-center"> - </p>;
      }

      const formattedDate = date.toLocaleDateString();

      return <p className="text-center"> {formattedDate} </p>;
    },
  },
    {
      accessorKey: "car.destinationPort",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <p> Destination Port </p>
          </div>
        );
      },
    },
    {
      accessorKey: "car.originPort",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <p> Origin Port </p>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Shipping Due",
      id: "price",
      cell: ({ row }) => {
        const price = row.getValue("price") as {
          id: number;
          totalAmount: number;
          currencyId: number;
        };
        return <p className="text-center"> {price?.totalAmount} </p>;
      },
    },
    {
      accessorKey: "price",
      header: "Purchase Due",
      cell: ({ row }) => {
        const price = row.getValue("price") as {
          id: number;
          totalAmount: number;
          currencyId: number;
        };
        return <p className="text-center"> {price?.totalAmount} </p>;
      },
    },
    {
      accessorKey: "price",
      header: "Total Due",
      cell: ({ row }) => {
        const price = row.getValue("price") as {
          id: number;
          totalAmount: number;
          currencyId: number;
        };
        return <p className="text-center"> {price?.totalAmount} </p>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vin = row.getValue("vin") as string;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(vin)}
              >
                Copy Vin Code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  href={`/pdf?token=${pdfToken}&userId=${userId}&vin=${vin}&type=copart`}
                >
                  Copart Invoice
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/pdf?token=${pdfToken}&userId=${userId}&vin=${vin}&type=iaai`}
                >
                  IAAI Invoice
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/pdf?token=${pdfToken}&userId=${userId}&vin=${vin}&type=shipping`}
                >
                  Shipping Invoice
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
