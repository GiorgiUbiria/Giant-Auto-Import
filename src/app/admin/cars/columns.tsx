"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import Link from "next/link";
import { CarData, Image as ImageType } from "@/lib/interfaces";
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
import DeleteButton from "@/components/deleteCar/deleteButton";

export const columns: ColumnDef<CarData>[] = [
  {
    accessorKey: "car.createdAt",
    id: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Purchase Date
          <ArrowUpDown className="ml-1 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date;

      if (!createdAt || !(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
        return <p className="text-center"> - </p>;
      }

      const date = new Date(createdAt);

      const isSpecificDate =
        date.getFullYear() === 1 &&
        date.getMonth() === 0 &&
        date.getDate() === 1;

      if (isSpecificDate) {
        return <p className="text-center"> - </p>;
      }

      const formattedDate = date.toLocaleDateString();

      return <p className="text-center font-semibold"> {formattedDate} </p>;
    },
  },
  {
    accessorKey: "images",
    id: "images",
    header: ({ column }) => {
      return (
        <p className="text-center"> Photo </p>
      )
    },
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
        <div className="w-[92px] flex justify-center ml-8">
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
    header: ({ column }) => {
      return (
        <p className="text-center"> VIN </p>
      )
    },
    id: "vin",
    cell: ({ row }) => {
      const vin = row.getValue("vin") as string;
      return <Link href={`/car/${vin}`}>{vin}</Link>;
    },
  },
  // {
  // // Add date
  // }
  {
    accessorKey: "specifications.year",
    id: "year",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
    accessorKey: "car.auction",
    header: "Auction",
  },
  {
    accessorKey: "specifications.bodyType",
    header: "Body Type",
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
    accessorKey: "car.originPort",
    header: "Origin Port",
  },
  {
    accessorKey: "car.destinationPort",
    header: "Destination Port",
  },
  {
    accessorKey: "shippingDue",
    header: "Shipping Due",
    id: "price",
    cell: ({ row }) => {
      const price = row.getValue("price") as {
        id: number;
        totalAmount: number;
        auctionFee: number;
        shippingFee: number;
        currencyId: number;
      };
      return <p className="text-center"> {price?.shippingFee ? price.shippingFee : "-"} </p>;
    },
  },
  {
    accessorKey: "price",
    header: "Purchase Due",
    cell: ({ row }) => {
      const price = row.getValue("price") as {
        id: number;
        totalAmount: number;
        auctionFee: number;
        shippingFee: number;
        currencyId: number;
      };
      return <p className="text-center"> {price?.auctionFee ? price.auctionFee : "-"} </p>;
    },
  },
  {
    accessorKey: "price",
    header: "Total Due",
    cell: ({ row }) => {
      const price = row.getValue("price") as {
        id: number;
        totalAmount: number;
        auctionFee: number;
        shippingFee: number;
        currencyId: number;
      };
      return <p className="text-center"> {price?.totalAmount ? price.totalAmount : "-"} </p>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const vin = row.getValue("vin") as string;
      const carId = row.getValue("car.id") as number;
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
            <DropdownMenuItem>
              <Button
                onClick={() => navigator.clipboard.writeText(vin)}
                variant="outline"
                className="w-full text-center"
              >
                Copy Vin Code
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Button variant="link" className="text-center w-full">
                <Link href={`/admin/edit/${vin}`}>Edit Car</Link>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <DeleteButton carId={carId} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
