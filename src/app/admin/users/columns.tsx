"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DatabaseUser } from "@/lib/db";

import Link from "next/link";
import CloseDialog from "./dialog";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<Omit<DatabaseUser, "passowrd">>[] = [
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
    accessorKey: "role_id",
    header: "Role",
    cell: ({ row }) => {
      const role_id = row.getValue("role_id") as number;

      const role = role_id === 1 ? "User" : "Admin";

      return <div className="text-right font-medium">{role}</div>;
    },
  },
  {
    accessorKey: "actions",
    id: "actions",
    cell: ({ row }) => {
      return <CloseDialog />;
    },
  },
];
