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
    // Normalize email to lowercase
    const normalizedValues = {
      ...values,
      email: values.email.toLowerCase()
    };
    console.log(normalizedValues);
    const [data, error] = await execute(normalizedValues);

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
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="example@mail.com"
                  type="email"
                  className="h-10"
                  {...field}
                  required
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500">
                Enter your registered email address
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
              <FormLabel className="text-sm font-medium">Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="********"
                  type="password"
                  className="h-10"
                  {...field}
                  required
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500">
                Enter your password
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full h-10 font-medium"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : "Log In"}
        </Button>
      </form>
    </Form>
  )
}
