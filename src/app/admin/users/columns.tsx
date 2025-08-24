"use client";

import { ColumnDef } from "@tanstack/react-table";

import { selectUserSchema } from "@/lib/drizzle/schema";
import { z } from "zod";
import { Actions } from "./actions";

interface ColumnsTranslations {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  actions: string;
  actionsTranslations: {
    edit: string;
    delete: string;
    deleteConfirmDescription: string;
    cancel: string;
    deleteAction: string;
    deleting: string;
    deleteSuccess: string;
    deleteError: string;
  };
}

const SelectSchema = selectUserSchema.omit({
  password: true,
  passwordText: true,
  priceList: true,
});
type SelectSchemaType = z.infer<typeof SelectSchema>;

export const columns = (translations: ColumnsTranslations): ColumnDef<SelectSchemaType>[] => [
  { accessorKey: "fullName", header: translations.fullName },
  { accessorKey: "email", header: translations.email },
  { accessorKey: "phone", header: translations.phone },
  { accessorKey: "role", header: translations.role },
  {
    id: "actions",
    header: translations.actions,
    cell: ({ row }) => {
      return <Actions userId={row.getValue("id") as string} translations={translations.actionsTranslations} />;
    },
  },
];
