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
import Link from "next/link";
import DynamicHeader from "./dynamic-header";

const Navbar = async () => {
  const { user } = await validateRequest();

  const navigationLinks = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/contact",
      label: "Contact",
    },
    {
      href: "/about",
      label: "About Us",
    },
  ];

  return (
    <DynamicHeader>
      <nav className="hidden flex-col gap-12 font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/" className="w-max">
          <Image src={NavbarLogo} alt="Company logo" className="w-20 h-20" priority />
        </Link>
        <NavigationLinks links={navigationLinks} />
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
        <ModeToggle />
        <Avatar user={user} logout={logout} />
      </div>
    </DynamicHeader>
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
