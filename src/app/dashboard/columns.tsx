"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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

export default function getColumns(pdfToken: string): ColumnDef<CarData>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "car.id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
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
      header: "Year",
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
      accessorKey: "specifications.trim",
      header: "Trim",
    },
    {
      accessorKey: "specifications.country",
      header: "Country",
    },
    {
      accessorKey: "specifications.manufacturer",
      header: "Manufacturer",
    },
    {
      accessorKey: "specifications.titleNumber",
      header: "Title Number",
    },
    {
      accessorKey: "specifications.carfax",
      header: "Carfax",
    },
    {
      accessorKey: "specifications.fuelType",
      header: "Fuel Type",
    },
    {
      accessorKey: "parking_details.status",
      header: "Status",
    },
    {
      accessorKey: "parking_details.parkingDateString",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Parking Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "car.destinationPort",
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
              <DropdownMenuItem>
                <Link href={`/pdf?token=${pdfToken}`}>Invoice</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

export const columns: ColumnDef<CarData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "car.id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
    header: "Year",
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
    accessorKey: "specifications.trim",
    header: "Trim",
  },
  {
    accessorKey: "specifications.country",
    header: "Country",
  },
  {
    accessorKey: "specifications.manufacturer",
    header: "Manufacturer",
  },
  {
    accessorKey: "specifications.titleNumber",
    header: "Title Number",
  },
  {
    accessorKey: "specifications.carfax",
    header: "Carfax",
  },
  {
    accessorKey: "specifications.fuelType",
    header: "Fuel Type",
  },
  {
    accessorKey: "parking_details.status",
    header: "Status",
  },
  {
    accessorKey: "parking_details.parkingDateString",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Parking Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "car.destinationPort",
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
            <DropdownMenuItem>
              <Link href={`/pdf?token=${vin}`}>Invoice</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
