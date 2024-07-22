"use client";

import { ColumnDef } from "@tanstack/react-table";

import Link from "next/link";
import React from "react";
import { removeUser } from "@/lib/actions/userActions";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DbUser } from "@/lib/actions/dbActions";

export const columns: ColumnDef<Omit<DbUser, "passowrd">>[] = [
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
      );
    },
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return <p className="">{id}</p>;
    },
  },
  {
    accessorKey: "customId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Custom ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const customId = row.getValue("customId") as string;
      return <p>{customId}</p>;
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

      const role = role_id === 1 ? "User" : "Accountant";

      return <div className="text-left font-medium">{role}</div>;
    },
  },
  {
    id: "actions",
    header: ({ column }) => {
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
