"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DatabaseUser } from "@/lib/db";
import Link from "next/link";

export const columns: ColumnDef<Omit<DatabaseUser, "passowrd">>[] = [
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
];
