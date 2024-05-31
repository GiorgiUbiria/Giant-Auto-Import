"use client";

import { ColumnDef } from "@tanstack/react-table";

import Link from "next/link";
import { DbCar } from "@/lib/interfaces";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type VisibleDbCar = Omit<
  DbCar,
  | "engineType"
  | "fined"
  | "arrived"
  | "originPort"
  | "shippingCompany"
  | "images"
>;

export const columns: ColumnDef<VisibleDbCar>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "vin",
    header: "Vin",
    cell: ({ row }) => {
      const vin = row.getValue("vin") as string;
      return <Link href={`/car/${vin}`}>{vin}</Link>;
    },
  },
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    accessorKey: "make",
    header: "Make",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "trim",
    header: "Trim",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "manufacturer",
    header: "Manufacturer",
  },
  {
    accessorKey: "titleNumber",
    header: "Title Number",
  },
  {
    accessorKey: "carfax",
    header: "Carfax",
  },
  {
    accessorKey: "fuelType",
    header: "Fuel Type",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "parkingDateString",
    header: "Parking Date",
  },
  {
    accessorKey: "destinationPort",
    header: "Destination Port",
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
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
