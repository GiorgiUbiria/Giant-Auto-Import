import { db } from "@/lib/db";
import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Form } from "@/lib/form";

import type { DatabaseUser } from "@/lib/db";
import type { ActionResult } from "@/lib/form";
import { LoginForm } from "@/components/login-form";
import Logo from "../../../public/logo.png";
import Image from "next/image";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <div className="min-h-max py-16 lg:py-28 flex flex-col items-center justify-center gap-2">
      <Image src={Logo} alt="Company Logo" width={150} height={150} />
      <Form action={login}>
        <LoginForm />
      </Form>
    </div>
  );
}

async function login(_: any, formData: FormData): Promise<ActionResult> {
  "use server";
  const email = formData.get("email");
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const existingUser = db
    .prepare("SELECT * FROM user WHERE email = ?")
    .get(email) as DatabaseUser | undefined;
  if (!existingUser) {
    return {
      error: "Incorrect email or password",
    };
  }

  const validPassword = await new Argon2id().verify(
    existingUser.password,
    password,
  );
  if (!validPassword) {
    return {
      error: "Incorrect email or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}
