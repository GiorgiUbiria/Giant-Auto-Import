import Image from "next/image";
import PlaceholderImage from "../../public/Mark-Elias-Photo_How_To_Shoot_Cars_Story-006-scaled-1.webp";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";

export default function CarsTable({
  cars,
  pdfToken,
}: {
  cars: any | undefined;
  pdfToken: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cars</CardTitle>
        <CardDescription>See cars</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">
                Parking Date
              </TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
              <TableHead>
                <span className="hidden md:table-cell">Shipping Company</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars &&
              cars.map((car: any) => (
                <TableRow key={car.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Product image"
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={PlaceholderImage}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {car.year} {car.make}{" "}
                    {car.model}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{car.fuelType ? car.fuelType : "Badge"}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {car.titleNumber}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {car.manufacturer}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {car.engineType}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {car.location}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Link href={`/pdf?token=${pdfToken}`}>
                            Invoice
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}
