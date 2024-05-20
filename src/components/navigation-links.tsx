"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface LinkProp {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export default function NavigationLinks({ links }: { links: LinkProp[] }) {
  const pathname = usePathname()

  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      {links.map((link) => (
        <Link
          href={link.href}
          key={link.href}
          className={`flex items-center gap-2 transition-colors hover:text-foreground ${
           pathname === link.href
              ? "font-semibold text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {link.icon && link.icon}
          <span className={link.href === "/" ? "sr-only" : ""}>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}
