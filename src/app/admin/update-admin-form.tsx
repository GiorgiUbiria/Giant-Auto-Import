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
			<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<FormField
					control={form.control}
					name="fullName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Full Name</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Enter your full name" />
							</FormControl>
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
								<Input type="email" {...field} placeholder="Enter your email" />
							</FormControl>
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
								<Input type="tel" {...field} placeholder="Enter your phone number" />
							</FormControl>
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
								<Input 
									type={showPassword ? "text" : "password"} 
									{...field} 
									placeholder="Enter new password (optional)"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="md:col-span-2 flex items-center space-x-2">
					<Checkbox
						id="showPassword"
						checked={showPassword}
						onCheckedChange={() => setShowPassword(!showPassword)}
					/>
					<label htmlFor="showPassword" className="text-sm text-muted-foreground">
						Show password
					</label>
				</div>
				<div className="md:col-span-2">
					<Button type="submit" className="w-full md:w-auto" disabled={isPending}>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Updating...
							</>
						) : (
							"Update Profile"
						)}
					</Button>
				</div>
			</form>
		</Form>
	)
}
