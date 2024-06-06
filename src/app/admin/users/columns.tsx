"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/interfaces";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { removeUser } from "@/lib/actions/userActions";
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<Omit<User, "passowrd">>[] = [
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
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID 
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return <Link href={`/admin/users/${id}`} className="hover:text-muted-foreground">{id}</Link>;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="flex gap-2">{name}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    id: "email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "roleId",
    header: "Role",
    id: "roleId",
    cell: ({ row }) => {
      const role_id = row.getValue("roleId") as number;

      const role = role_id === 1 ? "User" : "Admin";

      return <div className="text-left font-medium">{role}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return (
        <div className="flex gap-4">
          <button
            onClick={async () => {
              await removeUser(id);
            }}
          >
            Remove User
          </button>
        </div>
      );
    },
  },
];
