import Image from "next/image";
import { Menu, HomeIcon } from "lucide-react";
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

const Navbar = async () => {
  const { user } = await validateRequest();

  const navigationLinks = [
    {
      href: "/",
      label: "Home",
      icon: <HomeIcon className="h-6 w-6" />,
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
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-muted z-10 px-4 md:px-6">
      <nav className="hidden flex-col gap-12 font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Image src={NavbarLogo} alt="Company logo" className="w-12 h-12" />
        <NavigationLinks links={navigationLinks} />
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <div className="flex flex-col justify-between h-full">
            <nav className="grid gap-6 text-lg font-medium">
              <NavigationLinks links={navigationLinks} />
            </nav>
            <Image src={NavbarLogo} alt="Company logo" className="w-20 h-20 self-end" />
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto"></div>
        <ModeToggle />
        <Avatar user={user} logout={logout} />
      </div>
    </header>
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
