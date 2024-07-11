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
          className={`flex items-center text-nowrap text-2xl transition-colors dark:hover:text-zinc-500 hover:text-muted ${
            pathname === link.href
              ? "font-semibold text-primary"
              : "text-secondary-foreground"
          }`}
        >
          <span>{link.label}</span>
        </Link>
      ))}
    </>
  );
}
