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
import { addCarAction, handleUploadImages } from "@/lib/actions/carActions"
import { insertCarSchema } from "@/lib/drizzle/schema"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { getUsersAction } from "@/lib/actions/userActions"

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

const FormInitialSchema = insertCarSchema.omit({ id: true, createdAt: true, totalFee: true, shippingFee: true, destinationPort: true, });
const FormSchema = FormInitialSchema.extend(ImageSchema)

const processAndUploadImages = async (
  images: FileList | undefined,
  type: string,
  vin: string,
) => {
  if (!images || images.length === 0) return;

  const fileData = await Promise.all(
    Array.from(images).map(async (file: File) => {
      const ArrayBuffer = await file.arrayBuffer();
      return {
        buffer: new Uint8Array(ArrayBuffer),
        size: file.size,
        type: file.type,
        name: file.name,
      };
    }),
  );

  const urls = await handleUploadImages(
    type as "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP",
    vin,
    fileData.map((file) => file.size),
  );

  await Promise.all(
    urls.map((url: string, index: number) =>
      fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": images[index].type,
        },
        body: fileData[index].buffer,
      }),
    ),
  );
};

export function AddCarForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      vin: "",
      year: new Date().getFullYear(),
      make: "",
      model: "",
      auction: "Copart",
      originPort: "NJ",
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
    },
  })

  const { isPending: isPendingUsers, execute: executeUsers, data: users } = useServerAction(getUsersAction);
  const { execute, isPending } = useServerAction(addCarAction, {
    onStart: () => {
      console.log("Server action started");
    },
    onSuccess: ({ data }) => {
      console.log("Server action success:", data);
    },
    onError: ({ err }) => {
      console.error("Server action error:", err);
    },
    onFinish: async ([data, err]) => {
      try {
        if (data?.success === false) {
          throw new Error(data.message);
        }

        const { delivery_images, pick_up_images, warehouse_images, auction_images, vin } = data?.data;

        await Promise.all([
          processAndUploadImages(warehouse_images, "WAREHOUSE", vin),
          processAndUploadImages(auction_images, "AUCTION", vin),
          processAndUploadImages(pick_up_images, "PICK_UP", vin),
          processAndUploadImages(delivery_images, "DELIVERED", vin),
        ]);

        toast.success(data?.message);
        router.push("/admin/cars");
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while submitting the form");
      }
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const { warehouse_images, pick_up_images, auction_images, delivery_images, ...carData } = values;
      execute(carData);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the form");
    }
  };

  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="w-2/3 space-y-6 my-8 bg-gray-700 p-3 rounded-md">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
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
            name="originPort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port of Origin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the origin port for ground fee calculation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NJ">New Jersey (NJ)</SelectItem>
                    <SelectItem value="TX">Texas (TX)</SelectItem>
                    <SelectItem value="GA">Georgia (GA)</SelectItem>
                    <SelectItem value="CA">California (CA)</SelectItem>
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
                <Select onValueChange={field.onChange} onOpenChange={async () => { await executeUsers(); }}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the owner of the car" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isPendingUsers && <Loader2 className="animate-spin" />}
                    {users && users.map((user) => (
                      <SelectItem value={user.id} key={user.id}>{user.fullName}</SelectItem>
                    ))}
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
