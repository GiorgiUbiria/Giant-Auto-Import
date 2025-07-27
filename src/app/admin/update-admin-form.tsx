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
import { useTranslations } from "next-intl";

type Props = {
	user: z.infer<typeof selectUserSchema>
}

export function UpdateAdminForm({ user }: Props) {
	const t = useTranslations("UpdateAdminForm");
	const [showPassword, setShowPassword] = useState(false);
	
	const FormSchema = z.object({
		id: z.string().min(1, t("validation.userIdRequired")),
		email: z.string().email(t("validation.invalidEmail")).optional().or(z.literal("")),
		phone: z.string().optional().or(z.literal("")),
		fullName: z.string().min(1, t("validation.fullNameRequired")),
		passwordText: z.string().optional().or(z.literal("")),
	})
	
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			id: user?.id || "",
			fullName: user?.fullName || "",
			email: user?.email || "",
			passwordText: user?.passwordText || "",
			phone: user?.phone || "",
		},
	})

	const { isPending, execute } = useServerAction(updateUserAction);

	if (!user) {
		return null;
	}

	const onSubmit = async (values: z.infer<typeof FormSchema>) => {
		try {
			// Normalize email to lowercase if provided
			const normalizedValues = {
				...values,
				email: values.email ? values.email.toLowerCase() : values.email
			};
			const [data, error] = await execute(normalizedValues);

			if (error || data?.success === false) {
				toast.error(data?.message || t("updateFailed"));
				console.error(error);
			} else {
				toast.success(data?.message || t("profileUpdated"));
			}
		} catch (error) {
			toast.error(t("unexpectedError"));
			console.error(error);
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
							<FormLabel className="leading-relaxed">{t("fullName")}</FormLabel>
							<FormControl>
								<Input {...field} placeholder={t("fullNamePlaceholder")} className="leading-relaxed" />
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
							<FormLabel className="leading-relaxed">{t("email")}</FormLabel>
							<FormControl>
								<Input type="email" {...field} placeholder={t("emailPlaceholder")} className="leading-relaxed" />
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
							<FormLabel className="leading-relaxed">{t("phone")}</FormLabel>
							<FormControl>
								<Input type="tel" {...field} placeholder={t("phonePlaceholder")} className="leading-relaxed" />
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
							<FormLabel className="leading-relaxed">{t("password")}</FormLabel>
							<FormControl>
								<Input 
									type={showPassword ? "text" : "password"} 
									{...field} 
									placeholder={t("passwordPlaceholder")}
									className="leading-relaxed"
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
					<label htmlFor="showPassword" className="text-sm text-muted-foreground leading-relaxed">
						{t("showPassword")}
					</label>
				</div>
				<div className="md:col-span-2">
					<Button type="submit" className="w-full md:w-auto" disabled={isPending}>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{t("updating")}
							</>
						) : (
							t("updateProfile")
						)}
					</Button>
				</div>
			</form>
		</Form>
	)
}
