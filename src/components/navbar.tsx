import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getAuth } from "@/lib/auth";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CopartLogo from "../../public/copart-logo.png";
import IAAILogo from "../../public/iaai-logo.png";
import NavbarLogo from "../../public/logo.png";
import LocaleSwitcher from "./LocaleSwitcher";
import Avatar from "./avatar";
import DynamicHeader from "./dynamic-header";
import NavigationLinks from "./navigation-links";
import { getTranslations } from "next-intl/server";

const Navbar = async () => {
  const { user } = await getAuth();
  const t = await getTranslations("Navbar");
  const tHowTo = await getTranslations("HowTo");

  const navigationLinks = [
    {
      href: "/",
      label: t("home"),
    },
    {
      href: "/contact",
      label: t("contact"),
    },
    {
      href: "/about",
      label: t("about"),
    },
    {
      href: "/calculator",
      label: t("calculator"),
    },
    {
      href: "/how-to",
      label: tHowTo("navbar"),
    },
  ];

  if (user?.role === "ADMIN") {
    navigationLinks.push(
      {
        href: "/admin",
        label: t("admin_panel"),
      },
      {
        href: "/admin/cars",
        label: t("cars"),
      },
      {
        href: "/admin/add_car",
        label: t("add_car"),
      },
      {
        href: "/admin/users",
        label: t("users"),
      },
      {
        href: "/admin/signup",
        label: t("register"),
      }
    );
  }

  if (user?.role.includes("CUSTOMER")) {
    navigationLinks.push({
      href: "/dashboard",
      label: t("dashboard"),
    });
  }
  return (
    <div>
      <DynamicHeader>
        <nav className="flex justify-between items-center w-full px-4 py-2 sm:px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 md:hidden"
              >
                <Menu className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="text-primary w-64 sm:w-80">
              <div className="flex flex-col justify-between h-full py-6">
                {navigationLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center text-black dark:text-white dark:focus-text-yellow-300 text-nowrap font-semibold focus:text-yellow-300 text-base sm:text-lg md:text-base transition-colors hover:text-yellow-500 dark:hover:text-yellow-500 py-2"
                    >
                      <span>{link.label}</span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="w-max md:hidden">
            <Image
              src={NavbarLogo}
              alt="Company logo"
              className="size-14 sm:size-16 brightness-0 invert custom-shadow"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link href="/" className="w-max">
              <Image
                src={NavbarLogo}
                alt="Company logo"
                className="size-16 lg:size-20 brightness-0 invert custom-shadow"
                priority
              />
            </Link>
            <div className="flex gap-2 ml-4 lg:ml-8">
              <Link href="https://www.copart.com/login/" className="w-max">
                <Image
                  src={CopartLogo}
                  alt="Company logo"
                  className="size-16 lg:size-20"
                  priority
                />
              </Link>
              <Link
                href="https://login.iaai.com/Identity/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3DAuctionCenterPortal%26redirect_uri%3Dhttps%253A%252F%252Fwww.iaai.com%252Fsignin-oidc%26response_type%3Dcode%26scope%3Dopenid%2520profile%2520email%2520phone%2520offline_access%2520BuyerProfileClaims%26code_challenge%3D9PMRV8ReGXfo8_dLHnDBMBWLnrRs9fdpGSejoqBUzaA%26code_challenge_method%3DS256%26response_mode%3Dform_post%26nonce%3D638574975578455032.NzYwYmFhZWUtZDY5ZS00NzYwLWIzNjAtNjYxYWFiMzliYzI2ODc1Y2U3YTEtMmFiNy00YjY4LWJiMTUtMzk1ODE2NDZhNTRj%26state%3DCfDJ8BCy1GGolWFFkdQe4OIhgEJEuQoihIhAIadE97gWAxz1OCihd0THPTDDIVWW_eXiQUhav40uR_NXpvfFZDIgb2Sqr07Rt0YSEf9UTmhZWaubMZ_e1Cc99VJ-b6-2rHIF3TfJxY4YJOh4UbdTGswM8_vyPqOKlfKuKxTINcb6sqo2YR7KUTjNxOa0bMK134T-dLwzmZKaFhL0MgL2aSaFN5ti29F9QgE-hs9kemYNqcKUyTUUzXGJrGrPiggrkhb3KGFTUWwHnBS2wenwYFKALoF_k8R27ikmrZjUR-5ArZt2wREvFIrkZ0kzlUqgMb_CIz8MoAa6Dqm9urLp6-P3ogqu2MENhbo77rLSWhBIxCizH1awZ_R4Y-_RXLe6VdzAs58a0Lu0pD5yppLnR9SovNyiaoyoFHjFaaBMhmjDncocyEx1rG3O8-0U85wdoSPcWDz6XolwlBCa7AQ6_MkLedhkpo3I7a9E6Xc0o2_CHtek"
                className="w-max"
              >
                <Image
                  src={IAAILogo}
                  alt="Company logo"
                  className="size-16 lg:size-20"
                  priority
                />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LocaleSwitcher />
            <Avatar user={user} />
          </div>
        </nav>
      </DynamicHeader>
      <div className="hidden md:flex">
        <NavigationLinks links={navigationLinks} />
      </div>
    </div>
  );
};

export default Navbar;
