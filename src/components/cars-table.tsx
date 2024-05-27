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
        <CardTitle>Cars - {cars.length}</CardTitle>
        <CardDescription>See cars</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="hidden md:table-cell">Vehicle</TableHead>
              <TableHead className="hidden md:table-cell">Vin</TableHead>
              <TableHead className="hidden md:table-cell">Fuel Type</TableHead>
              <TableHead className="hidden md:table-cell">Container</TableHead>
              <TableHead className="hidden md:table-cell">Booking</TableHead>
              <TableHead className="hidden md:table-cell">Title</TableHead>
              <TableHead className="hidden md:table-cell">Shipment</TableHead>
              <TableHead className="hidden md:table-cell">
                Origin Port
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Destination Port
              </TableHead>
              <TableHead className="hidden md:table-cell">Lot</TableHead>
              <TableHead>
                <span className="hidden md:table-cell">Shipping Company</span>
              </TableHead>
              <TableHead></TableHead> {/* Empty header for actions column */}
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
                    <Badge variant="outline">{car.status}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{car.date}</TableCell>
                  <TableCell className="font-medium">
                    {car.vehicle || "-"}{" "}
                    {/* Add empty cell if vehicle field is missing */}
                  </TableCell>
                  <TableCell className="font-medium">
                    {car.vin || "-"}{" "}
                    {/* Add empty cell if vin field is missing */}
                  </TableCell>
                  <TableCell className="font-medium">
                    {car.fuelType || "-"}{" "}
                    {/* Add empty cell if fuelType field is missing */}
                  </TableCell>
                  <TableCell className="font-medium">
                    {car.container || "-"}{" "}
                    {/* Add empty cell if container field is missing */}
                  </TableCell>
                  <TableCell className="font-medium">
                    {car.booking || "-"}{" "}
                    {/* Add empty cell if booking field is missing */}
                  </TableCell>
                  <TableCell className="font-medium">
                    {car.title || "-"}{" "}
                    {/* Add empty cell if title field is missing */}
                  </TableCell>
                  <TableCell className="font-medium">
                    {car.shipment || "-"}{" "}
                    {/* Add empty cell if shipment field is missing */}
                  </TableCell>
                  <TableCell className="font-medium">
                    {car.originPort || "-"}{" "}
                    {/* Add empty cell if originPort field is missing */}
                  </TableCell>
                  <TableCell className="font-medium">
                    {car.destinationPort || "-"}{" "}
                    {/* Add empty cell if destinationPort field is missing */}
                  </TableCell>
                  <TableCell className="font-medium">
                    {car.lot || "-"}{" "}
                    {/* Add empty cell if lot field is missing */}
                  </TableCell>
                  <TableCell className="font-medium">
                    {car.shipping || "-"}{" "}
                    {/* Add empty cell if shipping field is missing */}
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
                          <Link href={`/pdf?token=${pdfToken}`}>Invoice</Link>
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
