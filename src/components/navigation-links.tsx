"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface LinkProp {
  href: string;
  label: string;
}

export default function NavigationLinks({ links }: { links: LinkProp[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => (
        <Link
          href={link.href}
          key={link.href}
          className={`flex items-center text-nowrap text-xl transition-colors dark:hover:text-zinc-500 hover:text-muted-foreground ${
            pathname === link.href
              ? "font-semibold text-foreground"
              : "text-foreground"
          }`}
        >
          <span>{link.label}</span>
        </Link>
      ))}
    </>
  );
}
