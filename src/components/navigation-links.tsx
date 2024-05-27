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
          className={`flex items-center text-nowrap text-md transition-colors dark:hover:text-black hover:text-white ${
            pathname === link.href
              ? "font-semibold text-black"
              : "text-foreground"
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
