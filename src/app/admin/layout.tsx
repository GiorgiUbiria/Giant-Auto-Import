import Link from "next/link";
import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth";

import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }

  return (
    <section>
      <nav className="flex items-center justify-between flex-wrap bg-base-100 p-4">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className="text-md">
              <Link href="/admin"> Cars </Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className="text-md">
              <Link href="/admin/users"> Users </Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className="text-md">
              <Link href="/admin/signup"> Register </Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className="text-md">
              <Link href="/admin/add"> Add a Car </Link>
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      </nav>
      {children}
    </section>
  );
}
