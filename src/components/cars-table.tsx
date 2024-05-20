import Image from "next/image";
import PlaceholderImage from "../../public/Mark-Elias-Photo_How_To_Shoot_Cars_Story-006-scaled-1.webp"
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
import { CarResponse } from "@/lib/interfaces";

export default function CarsTable({ cars }: { cars: CarResponse | undefined }) {
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
              cars.data.map((car) => (
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
                    {car.specifications.year} {car.specifications.make}{" "}
                    {car.specifications.model}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{car.parkingDetails.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {car.specifications.titleState}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {car.parkingDetails.parkingDate}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {car.notes.mtlNotes}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {car.shipping.name}
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
                        <DropdownMenuItem>Invoice</DropdownMenuItem>
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
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> cars
        </div>
      </CardFooter>
    </Card>
  );
}
