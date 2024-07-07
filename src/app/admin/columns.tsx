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
    accessorKey: "images",
    id: "images",
    header: "", 
    cell: ({ row }) => {
      const images = row.getValue("images") as ImageType[];
      if (!images || images.length === 0) {
        return (
          <div className="w-[64px] flex justify-center ml-4">
            <div className="bg-gray-300 rounded-md size-16"></div>
          </div>
        );
      }
      return (
        <div className="w-[128px] flex justify-center ml-8">
          <Image
            alt="Product image"
            className="w-full aspect-square rounded-md object-cover"
            height="300"
            src={images.at(0)?.imageUrl!}
            width="300"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "car.id",
    id: "car.id",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const id = row.getValue("car.id") as number;
      return <p className="text-center"> {id} </p>;
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
    accessorKey: "specifications.fuelType",
    header: "Fuel Type",
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
  },
  {
    accessorKey: "car.arrivalDate",
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
    accessorKey: "price",
    header: "Price",
    id: "price",
    cell: ({ row }) => {
      const price = row.getValue("price") as {
        id: number;
        totalAmount: number;
        currencyId: number;
      };
      return <p> {price?.totalAmount} </p>;
    },
  },
  {
    accessorKey: "price.amountLeft",
    header: "Amount Left",
    id: "amount_left",
    cell: ({ row }) => {
      const price = row.getValue("amount_left") as number;
      return <p className="text-red-500"> {price} </p>;
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
