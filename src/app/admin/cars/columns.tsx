"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import IAAILogo from "../../../../public/iaai-logo.png";

import Link from "next/link";
import { CarData, Image as ImageType, Specifications } from "@/lib/interfaces";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteButton from "@/components/deleteCar/deleteButton";
import CopyToClipBoard from "@/components/copy-to-clipboard";

export const columns: ColumnDef<CarData>[] = [
  {
    accessorKey: "car.createdAt",
    id: "createdAt",
    header: ({ column }) => {
      return (
        <p className="text-center font-bold"> Date </p>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date;

      if (!createdAt || !(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
        return <p className="text-center"> - </p>;
      }

      const date = new Date(createdAt);

      const isSpecificDate =
        date.getFullYear() === 1 &&
        date.getMonth() === 0 &&
        date.getDate() === 1;

      if (isSpecificDate) {
        return <p className="text-center"> - </p>;
      }

      const formattedDate = date.toLocaleDateString();

      return <p className="text-center font-semibold"> {formattedDate} </p>;
    },
  },
  {
    accessorKey: "images",
    id: "images",
    header: "Photo",
    cell: ({ row }) => {
      const images = row.getValue("images") as ImageType[];
      if (!images || images.length === 0) {
        return (
          <div className="w-[128px] flex justify-center ml-8">
            <div className="bg-gray-300 rounded-md size-16 w-full"></div>
          </div>
        );
      }
      return (
        <div className="w-full flex justify-center">
          <Image
            alt="Product image"
            className="w-full h-[92px] aspect-square rounded-md object-cover"
            height="300"
            src={images[0]?.imageUrl!}
            width="300"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "specifications.vin",
    header: "VIN #  LOT #",
    id: "vin",
    cell: ({ row }) => {
      const vin = row.getValue("vin") as string;
      return (
        <div className="flex flex-col gap-2 w-[100px]">
          <div className="flex items-center gap-0.5">
            <Link href={`/car/${vin}`} className="text-md">{vin}</Link>
            <CopyToClipBoard text={vin} />
          </div>
          <Link href={`/car/${vin}`} className="text-md">{vin}</Link>
        </div>
      )
    },
  },
  {
    accessorKey: "specifications",
    id: "specs_model",
    header: "Vehicle",
    cell: ({ row }) => {
      const specs = row.getValue("specs_model") as Specifications;
      return (
        <div className="flex items-center justify-between w-[84px]">
          <p className="text-left"> {specs.year + " " + specs.make + " " + specs.model} </p>
          {specs.model !== "Copart" && <Image src={IAAILogo} alt="IAAI" className="size-8" />}
        </div>
      )
    },
  },
  {
    accessorKey: "specifications.bodyType",
    header: "Body",
  },
  {
    accessorKey: "car.keys",
    header: "Keys",
    cell: ({ row }) => {
      const keys = row.getValue("car.keys") as boolean;

      if (!keys) {
        return <p> - </p>;
      } else if (keys === true) {
        return <p className="font-semibold"> YES </p>
      } else if (keys === false) {
        return <p className="font-semibold"> NO </p>
      } else {
        return <p> - </p>
      }
    },
  },
  {
    accessorKey: "car.title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue("car.title") as boolean;

      if (!title) {
        return <p> - </p>;
      } else if (title === true) {
        return <p className="font-semibold"> YES </p>
      } else if (title === false) {
        return <p className="font-semibold"> NO </p>
      } else {
        return <p> - </p>
      }
    },
  },
  {
    accessorKey: "parking_details.status",
    header: "Status",
  },
  {
    accessorKey: "car.departureDate",
    id: "departureDate",
    header: "ETD",
    cell: ({ row }) => {
      const departureDate = row.getValue("departureDate") as Date;

      if (!departureDate) {
        return <p className="text-center"> - </p>;
      }

      const date = new Date(departureDate)

      const isSpecificDate =
        date.getFullYear() === 1 &&
        date.getMonth() === 0 &&
        date.getDate() === 1;

      if (isSpecificDate) {
        return <p> - </p>;
      }

      const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
      })

      return <p> {formattedDate} </p>;
    },
  },
  {
    accessorKey: "car.arrivalDate",
    id: "arrivalDate",
    header: "ETA",
    cell: ({ row }) => {
      const arrivalDate = row.getValue("arrivalDate") as Date;

      if (!arrivalDate) {
        return <p> - </p>;
      }

      const date = new Date(arrivalDate);

      const isSpecificDate =
        date.getFullYear() === 1 &&
        date.getMonth() === 0 &&
        date.getDate() === 1;

      if (isSpecificDate) {
        return <p> - </p>;
      }

      const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
      })

      return <p> {formattedDate} </p>;
    },
  },
  {
    accessorKey: "car.originPort",
    header: "Origin Port",
  },
  {
    accessorKey: "car.destinationPort",
    header: "Destination",
  },
  {
    accessorKey: "purchaseDue",
    header: "Purchase Due",
    cell: ({ row }) => {
      const price = row.getValue("price") as {
        id: number;
        totalAmount: number;
        auctionFee: number;
        shippingFee: number;
        currencyId: number;
      };
      return (
        <p className="text-primary font-bold text-md">{price?.auctionFee ? price.auctionFee + "$" : "-"}</p>
      )
    },
  },
  {
    accessorKey: "shippingDue",
    header: "Shipping Due",
    id: "price",
    cell: ({ row }) => {
      const price = row.getValue("price") as {
        id: number;
        totalAmount: number;
        auctionFee: number;
        shippingFee: number;
        currencyId: number;
      };
      return (
        <p className="text-primary font-bold text-md">{price?.shippingFee ? price.shippingFee + "$" : "-"}</p>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Total Due",
    cell: ({ row }) => {
      const price = row.getValue("price") as {
        id: number;
        totalAmount: number;
        auctionFee: number;
        shippingFee: number;
        currencyId: number;
      };
      return (
        <p className="text-primary font-bold text-md">{price?.totalAmount ? price.totalAmount + "$" : "-"}</p>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const vin = row.getValue("vin") as string;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Button variant="link" className="text-center w-full">
                <Link href={`/admin/edit/${vin}`}>Edit Car</Link>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <DeleteButton vin={vin} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
