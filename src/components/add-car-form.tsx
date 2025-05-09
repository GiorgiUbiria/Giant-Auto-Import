"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addCarAction } from "@/lib/actions/carActions";
import { insertCarSchema } from "@/lib/drizzle/schema";
import { cn, oceanShippingRates } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { getUsersAction } from "@/lib/actions/userActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { auctionData } from "@/lib/utils";
import { useState } from "react";
import { handleImages } from "@/lib/actions/bucketActions";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
];
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
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type)
      );
    }, "File type is not supported")
    .optional(),
  pick_up_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type)
      );
    }, "File type is not supported")
    .optional(),
  warehouse_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type)
      );
    }, "File type is not supported")
    .optional(),
  delivery_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type)
      );
    }, "File type is not supported")
    .optional(),
};

const FormInitialSchema = insertCarSchema.omit({
  id: true,
  auctionFee: true,
  gateFee: true,
  titleFee: true,
  environmentalFee: true,
  virtualBidFee: true,
  groundFee: true,
  oceanFee: true,
  totalFee: true,
  shippingFee: true,
  destinationPort: true,
});
const FormSchema = FormInitialSchema.extend(ImageSchema);

const processImages = async (
  images: FileList | undefined,
  type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP",
  vin: string
) => {
  if (!images || images.length === 0) return;

  const fileData = await Promise.all(
    Array.from(images).map(async (file: File) => {
      const arrayBuffer = await file.arrayBuffer();
      return {
        buffer: arrayBuffer,
        size: file.size,
        type: type,
        name: file.name,
      };
    })
  );

  const urls = await handleImages(
    type,
    vin,
    fileData.map((file) => file.size)
  );

  await Promise.all(
    urls.map((url: string, index: number) =>
      fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": images[index].type,
        },
        body: fileData[index].buffer,
      })
    )
  );
};

export function AddCarForm() {
  const router = useRouter();

  const [selectedAuctionLocation, setSelectedAuctionLocation] = useState("");
  const [selectedAuction, setSelectedAuction] = useState("Copart");
  const [isUploadingImages, setIsUploadingImages] = useState(false);

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
      fuelType: "GASOLINE",
      bookingNumber: "",
      containerNumber: "",
      lotNumber: "",
      trackingLink: "",
      purchaseFee: undefined,
      departureDate: null,
      arrivalDate: null,
      auctionLocation: "",
      insurance: "NO",
    },
  });

  const { execute, isPending } = useServerAction(addCarAction, {
    onError: (err) => {
      console.error(err.err.data);
    },
    onSuccess: async ({ data }) => {
      try {
        if (data?.success === false) {
          throw new Error(data.message);
        }

        setIsUploadingImages(true);
        await processImages(
          form.getValues("auction_images"),
          "AUCTION",
          form.getValues("vin")
        );
        await processImages(
          form.getValues("warehouse_images"),
          "WAREHOUSE",
          form.getValues("vin")
        );
        await processImages(
          form.getValues("delivery_images"),
          "DELIVERED",
          form.getValues("vin")
        );
        await processImages(
          form.getValues("pick_up_images"),
          "PICK_UP",
          form.getValues("vin")
        );
        setIsUploadingImages(false);

        toast.success(data?.message);
        router.push("/admin/cars");
      } catch (error) {
        console.error(error);
        toast.error(
          "An error occurred while submitting the form or processing images"
        );
      }
    },
  });

  const { isLoading, data } = useServerActionQuery(getUsersAction, {
    input: undefined,
    queryKey: ["getUsers"],
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const {
        warehouse_images,
        auction_images,
        pick_up_images,
        delivery_images,
        ...carData
      } = values;
      await execute(carData);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the form");
    }
  };

  const handleAuctionLocationChange = (location: string) => {
    setSelectedAuctionLocation(location);
  };

  const handleAuctionChange = (auction: string) => {
    setSelectedAuction(auction);
    setSelectedAuctionLocation("");
  };

  const originPorts = oceanShippingRates;
  const filteredOriginPorts = originPorts.filter((port) =>
    auctionData.some(
      (data) =>
        data.auctionLocation === selectedAuctionLocation &&
        data.port === port.shorthand
    )
  );

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className="w-full md:w-2/3 space-y-8 my-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg transition-all"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Information</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter the basic details about the vehicle</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">VIN*</FormLabel>
                <FormControl>
                  <Input {...field} required className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700" />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">VIN Code of the car</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Year*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    required
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Year</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Make*</FormLabel>
                <FormControl>
                  <Input {...field} required className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700" />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Car Manufacturer</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Model*</FormLabel>
                <FormControl>
                  <Input {...field} required className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700" />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Car Model</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping Details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter the shipping and tracking information</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FormField
            control={form.control}
            name="bookingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Booking #</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700" />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Booking #</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="containerNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Container #</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700" />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Container #</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lotNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Lot #</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700" />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Lot #</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackingLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Tracking Link</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700" />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Tracking Link</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="ownerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Owner</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700">
                      <SelectValue placeholder="Select the owner of the car" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="animate-spin h-5 w-5" />
                      </div>
                    ) : (
                      data?.map((user) => (
                        <SelectItem value={user.id} key={user.id}>
                          {user.fullName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Car Owner</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shippingStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700">
                      <SelectValue placeholder="Select the shipping status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AUCTION">Auction</SelectItem>
                    <SelectItem value="INNER_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                    <SelectItem value="LOADED">Loaded</SelectItem>
                    <SelectItem value="SAILING">Sailing</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Car shipping status</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchaseFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Purchase Fee*</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    required
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Purchase Fee</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Date of Departure</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal transition-all hover:border-primary",
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
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Date of Departure</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="arrivalDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Date of Arrival</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal transition-all hover:border-primary",
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
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Date of Arrival</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Date of Purchase*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal transition-all hover:border-primary",
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
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Date of Purchase</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Specifications</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter the vehicle&apos;s specifications and features</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FormField
            control={form.control}
            name="keys"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Keys</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700">
                      <SelectValue placeholder="Select if the keys for the car are available" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="YES">Yes</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Keys for the car</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Title</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700">
                      <SelectValue placeholder="Select if the title of the car is available" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="YES">Yes</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Title of the car</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bodyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Body/Vehicle Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700">
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
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Body Type</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Fuel Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700">
                      <SelectValue placeholder="Select if the keys for the car are available" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GASOLINE">Gas</SelectItem>
                    <SelectItem value="HYBRID_ELECTRIC">
                      Hybrid (Electric)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Fuel Type</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Auction Information</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter the auction and port details</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FormField
            control={form.control}
            name="auction"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Auction</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleAuctionChange(value);
                  }}
                  defaultValue="Copart"
                  required
                >
                  <FormControl>
                    <SelectTrigger className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700">
                      <SelectValue placeholder="Select the auction where the car was bought" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Copart">Copart</SelectItem>
                    <SelectItem value="IAAI">IAAI</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Auction</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="auctionLocation"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5">
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Auction Location*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between transition-all hover:border-primary",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? Array.from(
                            new Set(
                              auctionData
                                .filter((data) => data.auction === selectedAuction)
                                .map((data) => data.auctionLocation)
                            )
                          ).find((location) => location === field.value) || "Select an auction location"
                          : "Select an auction location"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command className="text-primary">
                      <CommandInput placeholder="Search auction location..." />
                      <CommandList>
                        <CommandEmpty>No auction location found.</CommandEmpty>
                        <CommandGroup>
                          {Array.from(
                            new Set(
                              auctionData
                                .filter((data) => data.auction === selectedAuction)
                                .map((data) => data.auctionLocation)
                            )
                          ).map((location) => (
                            <CommandItem
                              key={location}
                              value={location}
                              onSelect={(value) => {
                                field.onChange(value);
                                handleAuctionLocationChange(value);
                              }}
                              className="text-primary hover:bg-secondary/50 transition-colors"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === location ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {location}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Auction Location</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="originPort"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Port of Origin*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  required
                >
                  <FormControl>
                    <SelectTrigger className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700">
                      <SelectValue placeholder="Select the origin port for ground fee calculation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredOriginPorts.map((port) => (
                      <SelectItem value={port.shorthand} key={port.state}>
                        {port.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Origin Port</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="insurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Insurance</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value as string}
                >
                  <FormControl>
                    <SelectTrigger className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700">
                      <SelectValue placeholder="Select if the car is insured" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="YES">YES</SelectItem>
                    <SelectItem value="NO">NO</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Insurance</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Images</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload images for different stages of the vehicle</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <FormField
            control={form.control}
            name="auction_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Auction Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) => onChange(event.target.files)}
                    className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Auction Images</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="warehouse_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Warehouse Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) => onChange(event.target.files)}
                    className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Warehouse Images</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="delivery_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Delivery Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) => onChange(event.target.files)}
                    className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Delivery Images</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pick_up_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700 dark:text-gray-200">Pick Up Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) => onChange(event.target.files)}
                    className="transition-all hover:border-primary focus:border-primary bg-gray-50 dark:bg-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">Pick Up Images</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full transition-all hover:bg-primary/90 font-semibold py-3 text-base rounded-lg shadow-md hover:shadow-lg"
          disabled={isPending || isUploadingImages}
        >
          {isPending || isUploadingImages ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Processing...</span>
            </div>
          ) : (
            "Add Car"
          )}
        </Button>
      </form>
    </Form>
  );
}