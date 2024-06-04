import Link from "next/link";

import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
