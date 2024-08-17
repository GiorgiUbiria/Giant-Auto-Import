"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { updateUserAction } from "@/lib/actions/authActions";
import { selectUserSchema } from "@/lib/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useServerAction } from "zsa-react";

const FormSchema = z.object({
	id: z.string(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	fullName: z.string().optional(),
	passwordText: z.string().optional(),
})

type Props = {
	user: z.infer<typeof selectUserSchema>
}

export function UpdateAdminForm({ user }: Props) {
	const [showPassword, setShowPassword] = useState(false);
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			id: user.id,
			fullName: user.fullName,
			email: user.email,
			passwordText: user.passwordText || "",
			phone: user.phone,
		},
	})

	const { isPending, execute } = useServerAction(updateUserAction);

	const onSubmit = async (values: z.infer<typeof FormSchema>) => {
		const [data, error] = await execute(values);

		if (data?.success === false) {
			toast.error(data?.message);
			console.error(error)
		} else {
			toast.success(data?.message);
		}
	}

	const handleSubmit = form.handleSubmit(onSubmit)

	return (
		<Form {...form}>
      <form onSubmit={handleSubmit} className="w-full md:w-1/2 lg:w-1/3 space-y-6 my-8 bg-gray-200 dark:bg-gray-700 p-3 rounded-md">
				<FormField
					control={form.control}
					name="fullName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Full Name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormDescription>
								Full Name of the user
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" {...field} />
							</FormControl>
							<FormDescription>
								Email of the user
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Phone Number</FormLabel>
							<FormControl>
								<Input type="tel" {...field} />
							</FormControl>
							<FormDescription>
								Phone number of the user
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="passwordText"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input type={showPassword ? "text" : "password"} {...field} />
							</FormControl>
							<FormDescription>
								Password that is at least 8 characters long and contains a number
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex items-center space-x-2">
					<Checkbox
						id="showPassword"
						checked={showPassword}
						onCheckedChange={() => setShowPassword(!showPassword)}
					/>
					<label htmlFor="showPassword" className="text-sm">
						Show Password
					</label>
				</div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {
            isPending ? <Loader2 className="animate-spin" /> : "Update User"
          }
        </Button>
			</form>
		</Form>
	)
}
