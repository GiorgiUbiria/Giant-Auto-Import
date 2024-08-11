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
import { updateCarAction } from "@/lib/actions/carActions"
import { insertCarSchema, selectCarSchema } from "@/lib/drizzle/schema"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { getUsersAction } from "@/lib/actions/userActions"
import { useEffect } from "react"

const FormSchema = insertCarSchema.omit({ id: true, createdAt: true, totalFee: true, shippingFee: true, destinationPort: true, });
const CarSchema = selectCarSchema.omit({ destinationPort: true, createdAt: true })
type Car = z.infer<typeof  CarSchema>;

export function EditCarForm({ car } : { car: Car}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      vin: car.vin,
      year: car.year,
      make: car.make, 
      model: car.model,
      auction: car.auction,
      originPort: car.originPort,
      keys: car.keys,
      title: car.title,
      shippingStatus: car.shippingStatus,
      bodyType: car.bodyType,
      fuelType: car.fuelType,
      bookingNumber: car.bookingNumber,
      containerNumber: car.containerNumber,
      lotNumber: car.lotNumber,
      trackingLink: car.trackingLink,
      holder: car.holder,
      purchaseFee: car.purchaseFee,
      departureDate: car.departureDate,
      arrivalDate: car.arrivalDate,
			purchaseDate: car.purchaseDate,
			ownerId: car.ownerId,
    },
  })

  const { isPending, execute } = useServerAction(updateCarAction);
  const { isPending: isPendingUsers, execute: executeUsers, data: users} = useServerAction(getUsersAction);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const [data, error] = await execute(values);

    if (data?.success === false) {
      toast.error(data.message);
      console.error(error);
    } else {
      toast.success(data?.message);
    }
  }

  const handleSubmit = form.handleSubmit(onSubmit)

	useEffect(() => {
		executeUsers();
	}, [executeUsers])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="w-full space-y-6 my-8 bg-gray-700 p-3 rounded-md">
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
                <Select onValueChange={field.onChange} defaultValue={car.ownerId || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the owner of the car" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isPendingUsers && <Loader2 className="animate-spin" />} 
										<SelectItem value="none">None</SelectItem>
                    {users && users.map((user) => (
                      <SelectItem value={user.id} key={user.id}>{ user.fullName }</SelectItem>
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
        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {
            isPending ? (
              <Loader2 className="animate-spin" />
            ) : "Edit Car"
          }
        </Button>
      </form>
    </Form>
  )
}
