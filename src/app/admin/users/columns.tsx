"use client";

import { ColumnDef } from "@tanstack/react-table";

import Link from "next/link";
import React from "react";
import { removeUser } from "@/lib/actions/userActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { selectUserSchema } from "@/lib/drizzle/schema";
import { z } from "zod";

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
    header: () => {
      return (
        <div className="flex items-center justify-center">
          <span className="text-center">Actions</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return (
        <div className="flex items-center justify-center">
          <Dialog>
            <DialogTrigger>
              <div className="flex gap-2">
                <p className="text-md bg-red-500 border rounded-md border-white p-2 hover:bg-red-300">
                  Remove User
                </p>
                <Link href={`/admin/users/${id}`}>
                  <p className="text-md bg-white dark:bg-black hover:scale-105 dark:text-white text-gray-900  border rounded-md border-white p-2">
                    Edit User
                  </p>
                </Link>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to remove this user?
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently remove the
                  user with the ID - <b>{id}</b> from the database.
                </DialogDescription>
              </DialogHeader>
              <Button
                variant="outline"
                onClick={async () => {
                  await removeUser(id);
                }}
              >
                Remove User
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];
