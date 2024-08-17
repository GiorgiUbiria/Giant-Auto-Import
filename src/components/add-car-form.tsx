"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addCarAction } from "@/lib/actions/carActions"
import { insertCarSchema } from "@/lib/drizzle/schema"
import { cn, oceanShippingRates } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { getUsersAction } from "@/lib/actions/userActions"
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks"
import { auctionData } from "@/lib/utils"
import { useState } from "react"

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
const MAX_IMAGE_SIZE = 4;

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};

const ImageSchema = {
  auction_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type),
      );
    }, "File type is not supported")
    .optional(),
  pick_up_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type),
      );
    }, "File type is not supported")
    .optional(),
  warehouse_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type),
      );
    }, "File type is not supported")
    .optional(),
  delivery_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type),
      );
    }, "File type is not supported")
    .optional(),
}

const FormInitialSchema = insertCarSchema.omit({ id: true, totalFee: true, shippingFee: true, destinationPort: true, });
const FormSchema = FormInitialSchema.extend(ImageSchema)

const processImages = async (
  images: FileList | undefined,
  type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP",
): Promise<Array<{ buffer: number[]; size: number; name: string; type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP"; }>> => {
  if (!images || images.length === 0) return [];

  const fileData = await Promise.all(
    Array.from(images).map(async (file: File) => {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      return {
        buffer: Array.from(uint8Array),
        size: file.size,
        type: type,
        name: file.name,
      };
    }),
  );

  return fileData;
};

export function AddCarForm() {
  const router = useRouter();
  const [selectedAuctionLocation, setSelectedAuctionLocation] = useState("");
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      vin: "",
      year: new Date().getFullYear(),
      make: "",
      model: "",
      auction: "Copart",
      keys: "YES",
      title: "YES",
      shippingStatus: "AUCTION",
      bodyType: "SEDAN",
      fuelType: "DIESEL",
      bookingNumber: "",
      containerNumber: "",
      lotNumber: "",
      trackingLink: "",
      holder: "",
      purchaseFee: 0,
      departureDate: null,
      arrivalDate: null,
      auctionLocation: "",
    },
  })

  const { execute, isPending } = useServerAction(addCarAction, {
    onError: (err) => { console.error(err.err.data) },
    onSuccess: async ({ data }) => {
      try {
        if (data?.success === false) {
          throw new Error(data.message);
        }

        toast.success(data?.message);
        router.push("/admin/cars");
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while submitting the form");
      }
    },
  });

  const { isLoading, data } = useServerActionQuery(getUsersAction, {
    input: undefined,
    queryKey: ["getUsers"],
  })

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const { warehouse_images, pick_up_images, auction_images, delivery_images, ...carData } = values;

      const imagePromises = [
        processImages(warehouse_images, "WAREHOUSE"),
        processImages(auction_images, "AUCTION"),
        processImages(pick_up_images, "PICK_UP"),
        processImages(delivery_images, "DELIVERED"),
      ];

      const imageResults = await Promise.all(imagePromises);

      const imagesData = imageResults.flat().filter(Boolean);

      const inputData = {
        ...carData,
        ...(imagesData.length > 0 && { images: imagesData }),
      };

      await execute(inputData);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the form");
    }
  };

  const handleAuctionLocationChange = (location: string) => {
    setSelectedAuctionLocation(location);
  };

  const originPorts = oceanShippingRates;
  const filteredOriginPorts = originPorts.filter(port =>
    auctionData.some(data => data.auctionLocation === selectedAuctionLocation && data.port === port.shorthand)
  );

  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="w-full md:w-2/3 space-y-6 my-4 bg-gray-200/90 dark:bg-gray-700 p-3 rounded-md">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN*</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormDescription>
                  VIN Code of the car
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    required
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Year
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make*</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormDescription>
                  Car Manufacturer
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model*</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormDescription>
                  Car Model
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          <FormField
            control={form.control}
            name="bookingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking #</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  Booking #
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="containerNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Container #</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  Container #
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lotNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lot #</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  Lot #
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackingLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracking Link</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  Tracking Link
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="holder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Holder</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  Car Holder
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchaseFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Fee*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    required
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Purchase Fee
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Departure</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value!}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Date of Departure
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="arrivalDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Arrival</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value!}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Date of Arrival
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Purchase*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value!}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Date of Purchase
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          <FormField
            control={form.control}
            name="keys"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keys</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select if the keys for the car are available" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="YES">Yes</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Keys for the car
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select if the title of the car is available" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="YES">Yes</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Title of the car
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bodyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body/Vehicle Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type of the vehicle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SEDAN">Sedan</SelectItem>
                    <SelectItem value="ATV">ATV</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="PICKUP">Pick-Up</SelectItem>
                    <SelectItem value="BIKE">Bike</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Body Type
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select if the keys for the car are available" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DIESEL">Diesel</SelectItem>
                    <SelectItem value="GASOLINE">Gasoline</SelectItem>
                    <SelectItem value="HYBRID_ELECTRIC">Hybric (Electric)</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Fuel Type
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          <FormField
            control={form.control}
            name="auction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auction</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the auction where the car was bought" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Copart">Copart</SelectItem>
                    <SelectItem value="IAAI">IAAI</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Auction
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="auctionLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auction Location*</FormLabel>
                <Select onValueChange={(value) => handleAuctionLocationChange(value)} defaultValue={field.value!} required>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an auction location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {
                      Array.from(new Set(auctionData.map((data) => data.auctionLocation))).map((location) => (
                        <SelectItem value={location} key={location}>{location}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <FormDescription>
                  Auction Location
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="originPort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port of Origin*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} required>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the origin port for ground fee calculation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredOriginPorts.map((port) => (
                      <SelectItem value={port.shorthand} key={port.state}>{port.state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Origin Port
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ownerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the owner of the car" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                      data?.map((user) => (
                        <SelectItem value={user.id} key={user.id}>{user.fullName}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Car Owner
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          <FormField
            control={form.control}
            name="auction_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Auction Images</FormLabel>
                <FormControl>
                  <Input type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) =>
                      onChange(event.target.files)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Auction Images
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="warehouse_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Warehouse Images</FormLabel>
                <FormControl>
                  <Input type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) =>
                      onChange(event.target.files)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Warehouse Images
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="delivery_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Delivery Images</FormLabel>
                <FormControl>
                  <Input type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) =>
                      onChange(event.target.files)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Delivery Images
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pick_up_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Pick Up Images</FormLabel>
                <FormControl>
                  <Input type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) =>
                      onChange(event.target.files)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Pick Up Images
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {
            isPending ? (
              <Loader2 className="animate-spin" />
            ) : "Add Car"
          }
        </Button>
      </form>
    </Form>
  )
}
