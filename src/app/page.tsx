import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  return (
    <>
      <h1>Hi, {user.email}!</h1>
      <p>Your user ID is {user.id}.</p>
      <p> Your role is {user.role_id}</p>
      <div></div>
    </>
  );
}

