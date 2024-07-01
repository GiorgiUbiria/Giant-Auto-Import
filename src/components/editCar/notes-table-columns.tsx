"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Note } from "@/lib/interfaces";
import { Button } from "../ui/button";

export const columns: ColumnDef<Note>[] = [
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
        className="mb-1"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="mb-1"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    id: "id",
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
    accessorKey: "createdAt",
    header: "Created At",
    id: "createdAt",
    cell: ({ row }) => {
      return <p className="text-center"> {row.getValue("createdAt")} </p>;
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    id: "note",
    cell: ({ row }) => {
      return <p className="text-center"> {row.getValue("note")} </p>;
    },
  }
];
