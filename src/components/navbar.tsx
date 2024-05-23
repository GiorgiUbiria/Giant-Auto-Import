import { Menu, Package2, Search, HomeIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { lucia, validateRequest } from "@/lib/auth";
import Avatar from "./avatar";
import { ActionResult } from "@/lib/form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ModeToggle } from "./theme-toggle";
import NavigationLinks from "./navigation-links";

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
  ];

  user && navigationLinks.push(
    {
      href: "/dashboard",
      label: "Dashboard",
    },
  )

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background z-10 px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
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
          <nav className="grid gap-6 text-lg font-medium">
            <NavigationLinks links={navigationLinks} />
          </nav>
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
