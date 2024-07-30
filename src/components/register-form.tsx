"use client"

import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent
} from "./ui/select";
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { insertUserSchema } from "@/lib/drizzle/schema";
import { useState } from "react";
import { ActionResult } from "@/lib/utils";
import { signup } from "@/lib/actions/authActions";

const FormSchema = insertUserSchema.omit({ id: true });

export default function RegisterForm() {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      role: "CUSTOMER",
      fullName: "",
      email: "",
      password: "",
      phone: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    console.log("Hit the onSubmit");
    setSubmitting(true);

    const result: ActionResult = await signup(values);

    setSubmitting(false);

    if (result.success === false) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
    }
  }

  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Max Maximov" {...field} required />
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
                <Input placeholder="example@mail.com" type="email" {...field} required />
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
                <Input placeholder="+995 555-55-55-55" type="tel" {...field} required />
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} required />
              </FormControl>
              <FormDescription>
                Password that is at least 8 characters long and contains a number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} required>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role for the new user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
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
        <Button type="submit" onClick={() => { console.log("Clicked")}}>
          {
            submitting ? "Submitting..." : "Register"
          }
        </Button>
      </form>
    </Form>
  )
}
