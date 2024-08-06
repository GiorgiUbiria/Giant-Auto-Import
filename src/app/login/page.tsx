import LoginForm from "@/components/login-form";
import { getAuth } from "@/lib/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import Logo from "../../../public/logo.png";

export default async function Page() {
  const { user } = await getAuth();
  if (user) {
    return redirect("/");
  }
  return (
    <div className="min-h-max py-16 lg:py-28 flex flex-col items-center justify-center gap-2">
      <Image src={Logo} alt="Company Logo" width={150} height={150} />
      <LoginForm />
    </div>
  );
}
