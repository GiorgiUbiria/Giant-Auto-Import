import LoginForm from "@/components/login-form";
import { getAuth } from "@/lib/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import Logo from "../../../public/logo.png";
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const { user } = await getAuth();
  if (user) {
    return redirect("/");
  }
  const t = await getTranslations('Auth');

  return (
    <div className="w-full grid place-items-center">
      <h1 className="text-3xl text-primary my-4"> {t('login')} </h1>
      <Image src={Logo} alt="Company Logo" width={150} height={150} />
      <LoginForm />
    </div>
  );
}
