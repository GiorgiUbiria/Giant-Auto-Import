"use client";

import { ColumnDef } from "@tanstack/react-table";

import { selectUserSchema } from "@/lib/drizzle/schema";
import { z } from "zod";
import { Actions } from "./actions";

const SelectSchema = selectUserSchema.omit({ password: true, passwordText: true, priceList: true, })

type SelectSchemaType = z.infer<typeof SelectSchema>

export const columns: ColumnDef<SelectSchemaType>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
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
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <Actions userId={row.getValue("id") as string} />
    },
  },
];
