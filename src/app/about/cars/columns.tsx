"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
  // {
  //   accessorKey: "specifications.vin",
  //   header: "VIN #  LOT #",
  //   id: "vin",
  //   cell: ({ row }) => {
  //     const vin = row.getValue("vin") as string;
  //     return (
  //       <div className="flex flex-col gap-2 w-[100px]">
  //         <Link href={`/car/${vin}`} className="text-md">{vin}</Link>
  //         <Link href={`/car/${vin}`} className="text-md">{vin}</Link>
  //       </div>
  //     )
  //   },
  // },
  // {
  //   accessorKey: "specifications",
  //   id: "specs_model",
  //   header: "Vehicle",
  //   cell: ({ row }) => {
  //     const specs = row.getValue("specs_model") as Specifications;
  //     return (
  //       <div className="flex items-center justify-between w-[84px]">
  //         <p className="text-left"> {specs.year + " " + specs.make + " " + specs.model} </p>
  //       </div>
  //     )
  //   },
  // },
  {
    accessorKey: "specifications.bodyType",
    header: "Body",
  },
  {
    accessorKey: "car.keys",
    header: "Keys",
  },
  {
    accessorKey: "car.title",
    header: "Title",
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
    accessorKey: "price",
    header: "Purchase",
    cell: ({ row }) => {
      const price = row.getValue("price") as {
        id: number;
        totalAmount: number;
        auctionFee: number;
        shippingFee: number;
        currencyId: number;
      };
      return (
        <div className="flex flex-col gap-1 justify-between">
          <Accordion type="single" collapsible className="w-[92px]">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <p className="text-left text-nowrap mr-1"> Total: <span className="font-bold">{price?.auctionFee ? price.auctionFee + "$" : <span className="ml-4"> - </span>}</span> </p>
              </AccordionTrigger>
              <AccordionContent>
                <p className="font-semibold text-sm text-left"> Due: <span className="text-red-500 font-bold text-md">{price?.auctionFee ? price.auctionFee + "$" : "-"}</span> </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
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
        <div className="flex flex-col gap-1 justify-between">
          <p> Total: {price?.auctionFee ? price.auctionFee + "$" : "-"} </p>
          <p className="font-semibold text-sm"> Due: <span className="text-red-500 font-bold text-md">{price?.auctionFee ? price.auctionFee + "$" : "-"}</span> </p>
        </div>
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
        <div className="flex flex-col gap-1 justify-between">
          <p> Total: {price?.auctionFee ? price.auctionFee + "$" : "-"} </p>
          <p className="font-semibold text-sm"> Due: <span className="text-red-500 font-bold text-md">{price?.auctionFee ? price.auctionFee + "$" : "-"}</span> </p>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
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
            {/* <DropdownMenuItem> */}
            {/*   <Button variant="link" className="text-center w-full"> */}
            {/*     <Link href={`/admin/edit/${vin}`}>Edit Car</Link> */}
            {/*   </Button> */}
            {/* </DropdownMenuItem> */}
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuItem> */}
            {/*   <DeleteButton carId={carId} /> */}
            {/* </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
