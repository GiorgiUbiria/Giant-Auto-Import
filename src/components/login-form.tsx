"use client"

import { Button } from "@/components/ui/button";
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
import { loginAction as action } from "@/lib/actions/authActions";
import { insertUserSchema } from "@/lib/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useServerAction } from "zsa-react";

const FormSchema = insertUserSchema.pick({ email: true, password: true });

export default function LoginForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { isPending, execute } = useServerAction(action);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    console.log(values);
    const [data, error] = await execute(values);

    if (data?.success === false) {
      toast.error(data.message);
      console.error(error);
    } else {
      toast.success(data?.message);
    }
  }

  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="w-full md:w-1/3 space-y-6 my-4 bg-gray-200/90 dark:bg-gray-700 p-3 rounded-md text-primary">
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
        <Button type="submit" className="w-full" disabled={isPending}>
          {
            isPending ? <Loader2 className="animate-spin" /> : "Log In"
          }
        </Button>
      </form>
    </Form>
  )
}
