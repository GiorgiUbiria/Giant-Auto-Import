import { lucia, validateRequest } from "@/lib/auth";
import { Form } from "@/lib/form";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import type { ActionResult } from "@/lib/form";
import { getCars } from "./actions";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  const cars = await getCars();

  return (
    <>
      <h1>Hi, {user.email}!</h1>
      <p>Your user ID is {user.id}.</p>
      <Form action={logout}>
        <button>Sign out</button>
      </Form>
      <div>
        {cars.data.map((car: any) => (
          <p key={car.id}> {car.id} </p>
        ))}
      </div>
    </>
  );
}

async function logout(): Promise<ActionResult> {
  "use server";
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/login");
}
