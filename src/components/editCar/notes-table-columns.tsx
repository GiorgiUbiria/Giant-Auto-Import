"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Note } from "@/lib/interfaces";
import { Button } from "../ui/button";

export const columns: ColumnDef<Note>[] = [
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
      const id = row.getValue("id") as number;
      return <p className="text-center"> {id} </p>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "note",
    header: "Note",
    id: "note",
    cell: ({ row }) => {
      const note = row.getValue("note") as string;
      return <p> {note} </p>;
    },
  }
];
