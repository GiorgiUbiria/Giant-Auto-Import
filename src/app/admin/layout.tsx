import Link from "next/link";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav className="flex items-center justify-between flex-wrap bg-base-100 p-4">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger><Link href="/admin"> Cars </Link></MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger><Link href="/admin/users"> Users </Link></MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger><Link href="/admin/signup"> Register </Link></MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      </nav>
      {children}
    </section>
  );
}
