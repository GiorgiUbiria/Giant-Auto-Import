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
          className={`flex items-center text-nowrap text-md transition-colors hover:text-foreground ${
            pathname === link.href
              ? "font-semibold text-foreground"
              : "text-muted-foreground"
          }`}
        >
          <span>
            {link.label}
          </span>
        </Link>
      ))}
    </>
  );
}
