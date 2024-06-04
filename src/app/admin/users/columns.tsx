"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/interfaces";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

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
    header: "ID",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return <Link href={`/admin/users/${id}`}>{id}</Link>;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
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
];
