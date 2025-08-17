import LoginForm from "@/components/login-form";
import { getAuth } from "@/lib/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import LogoDark from "../../../public/giant_logo_dark.png";
import LogoWhite from "../../../public/giant_logo_white.png";
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
          <div className="flex justify-center">
            <div className="relative w-[120px] h-[120px]">
              <Image
                src={LogoDark}
                alt="Company Logo"
                fill
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src={LogoWhite}
                alt="Company Logo"
                fill
                className="object-contain hidden dark:block"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary">
            {t('login')}
          </h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
