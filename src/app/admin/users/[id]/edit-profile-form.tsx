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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { selectUserSchema } from "@/lib/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
	id: z.string(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	fullName: z.string().optional(),
	role: z.enum(['CUSTOMER_DEALER', 'CUSTOMER_SINGULAR', 'MODERATOR', 'ACCOUNTANT', 'ADMIN']).optional(),
	passwordText: z.string().optional(),
})

type Props = {
	user: z.infer<typeof selectUserSchema>
}

export function UpdateProfileForm({ user }: Props) {
	const [showPassword, setShowPassword] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			id: user.id,
			role: user.role,
			fullName: user.fullName,
			email: user.email,
			passwordText: user.passwordText || "",
			phone: user.phone,
		},
	})

	const queryClient = useQueryClient();

	const onSubmit = async (values: z.infer<typeof FormSchema>) => {
		setIsPending(true);
		try {
			// Normalize email to lowercase if provided
			const normalizedValues = {
				...values,
				email: values.email ? values.email.toLowerCase() : values.email
			};

			const response = await fetch('/api/users', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(normalizedValues),
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || 'Failed to update user');
				return;
			}

			toast.success(data.message || 'User updated successfully!');

			// Invalidate users list to reflect changes
			await queryClient.invalidateQueries({
				queryKey: ["getUsers"],
				refetchType: "active",
			});

			// Invalidate specific user query if it exists
			await queryClient.invalidateQueries({
				queryKey: ["getUser", user.id],
				refetchType: "active",
			});

		} catch (error) {
			console.error('Error updating user:', error);
			toast.error('Failed to update user. Please try again.');
		} finally {
			setIsPending(false);
		}
	}

	const handleSubmit = form.handleSubmit(onSubmit)

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit} className="w-full space-y-6 my-8 bg-gray-700 p-3 rounded-md">
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
				<FormField
					control={form.control}
					name="role"
					render={({ field }) => (
						<FormItem>
							<FormLabel>User Role</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a role for the new user" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="CUSTOMER_SINGULAR">Customer (Singular)</SelectItem>
									<SelectItem value="CUSTOMER_DEALER">Customer (Dealer)</SelectItem>
									<SelectItem value="MODERATOR">Moderator</SelectItem>
									<SelectItem value="ACCOUNTANT">Accountant</SelectItem>
									<SelectItem value="ADMIN">Admin</SelectItem>
								</SelectContent>
							</Select>
							<FormDescription>
								Role of the user
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full" disabled={isPending}>
					{
						isPending ? <Loader2 className="animate-spin" /> : "Update User"
					}
				</Button>
			</form>
		</Form>
	)
}
