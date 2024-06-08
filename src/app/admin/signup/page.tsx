import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth";
import { Form } from "@/lib/form";

import { RegisterForm } from "@/components/register-form";

import { signup } from "@/lib/actions/authActions";

export default async function Page() {
  // const { user } = await validateRequest();
  // if (!user || (user && user.role_id !== 2)) {
  //   return redirect("/");
  // }

  return (
    <div className="min-h-max py-16 lg:py-28 flex flex-col items-center justify-center gap-2">
      <Form action={signup}>
        <RegisterForm />
      </Form>
    </div>
  );
}
