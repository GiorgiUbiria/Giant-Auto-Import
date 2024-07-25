import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { lucia, validateRequest } from "@/lib/auth";
import Avatar from "./avatar";
import { ActionResult } from "@/lib/form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ModeToggle } from "./theme-toggle";
import NavigationLinks from "./navigation-links";
import NavbarLogo from "../../public/logo.png";
import CopartLogo from "../../public/copart-logo.png";
import IAAILogo from "../../public/iaai-logo.png";
import Link from "next/link";
import DynamicHeader from "./dynamic-header";

const Navbar = async () => {
  const { user } = await validateRequest();

  const navigationLinks = [
    {
      href: "/contact",
      label: "Contact",
    },
    {
      href: "/about",
      label: "About Us",
    },
    {
      href: "/calculator",
      label: "Calculator",
    },
  ];

  return (
    <div>

      <DynamicHeader>
        <nav className="hidden flex-col gap-12 font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="/" className="w-max">
            <Image src={NavbarLogo} alt="Company logo" className="size-20" priority />
          </Link>
          <div className="flex gap-2 ml-8">
            <Link href="https://www.copart.com/login/" className="w-max">
              <Image src={CopartLogo} alt="Company logo" className="size-20" priority />
            </Link>
            <Link href="https://login.iaai.com/Identity/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3DAuctionCenterPortal%26redirect_uri%3Dhttps%253A%252F%252Fwww.iaai.com%252Fsignin-oidc%26response_type%3Dcode%26scope%3Dopenid%2520profile%2520email%2520phone%2520offline_access%2520BuyerProfileClaims%26code_challenge%3D9PMRV8ReGXfo8_dLHnDBMBWLnrRs9fdpGSejoqBUzaA%26code_challenge_method%3DS256%26response_mode%3Dform_post%26nonce%3D638574975578455032.NzYwYmFhZWUtZDY5ZS00NzYwLWIzNjAtNjYxYWFiMzliYzI2ODc1Y2U3YTEtMmFiNy00YjY4LWJiMTUtMzk1ODE2NDZhNTRj%26state%3DCfDJ8BCy1GGolWFFkdQe4OIhgEJEuQoihIhAIadE97gWAxz1OCihd0THPTDDIVWW_eXiQUhav40uR_NXpvfFZDIgb2Sqr07Rt0YSEf9UTmhZWaubMZ_e1Cc99VJ-b6-2rHIF3TfJxY4YJOh4UbdTGswM8_vyPqOKlfKuKxTINcb6sqo2YR7KUTjNxOa0bMK134T-dLwzmZKaFhL0MgL2aSaFN5ti29F9QgE-hs9kemYNqcKUyTUUzXGJrGrPiggrkhb3KGFTUWwHnBS2wenwYFKALoF_k8R27ikmrZjUR-5ArZt2wREvFIrkZ0kzlUqgMb_CIz8MoAa6Dqm9urLp6-P3ogqu2MENhbo77rLSWhBIxCizH1awZ_R4Y-_RXLe6VdzAs58a0Lu0pD5yppLnR9SovNyiaoyoFHjFaaBMhmjDncocyEx1rG3O8-0U85wdoSPcWDz6XolwlBCa7AQ6_MkLedhkpo3I7a9E6Xc0o2_CHtek" className="w-max">
              <Image src={IAAILogo} alt="Company logo" className="size-20" priority />
            </Link>
          </div>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 h-14 w-14 md:hidden"
            >
              <Menu className="h-8 w-8" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col justify-between h-full">
              <nav className="grid gap-6 text-lg font-medium">
                <NavigationLinks links={navigationLinks} />
              </nav>
              <Image
                src={NavbarLogo}
                alt="Company logo"
                className="w-20 h-20 self-end"
              />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto"></div>
          <Avatar user={user} logout={logout} />
          <p className="text-white text-2xl font-bold"> {user?.name ? user?.name : "" }</p>
        </div>
      </DynamicHeader>
      <NavigationLinks links={navigationLinks} />
    </div>
  );
};

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

export default Navbar;
