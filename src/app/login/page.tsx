import LoginForm from "@/components/login-form";
import { getAuth } from "@/lib/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import Logo from "../../../public/giant_logo_dark.png";
import { getTranslations } from 'next-intl/server';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export default async function Page() {
  const { user } = await getAuth();
  if (user) {
    return redirect("/");
  }
  const t = await getTranslations('Auth');

  return (
    <div className="min-h-screen w-full grid place-items-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md px-6 py-8 space-y-6">
        <div className="text-center space-y-4">
          <Image
            src={Logo}
            alt="Company Logo"
            width={100}
            height={100}
            className="mx-auto"
          />
          <h1 className="text-3xl font-bold text-primary">
            {t('login')}
          </h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
