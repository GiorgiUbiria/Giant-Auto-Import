"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./theme-toggle";

interface LinkProp {
  href: string;
  label: string;
}

export default function NavigationLinks({ links }: { links: LinkProp[] }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6 pl-8 bg-black items-center">
      {links.map((link) => (
        <Link
          href={link.href}
          key={link.href}
          className={`flex items-center text-white dark:text-white dark:focus-text-yellow-300 text-nowrap font-semibold focus:text-yellow-300 text-lg transition-colors hover:text-yellow-500 dark:hover:text-yellow-500 ${
            pathname === link.href
              ? "font-bold text-yellow-300 dark:text-yellow-300"
              : "text-secondary-foreground"
          }`}
        >
          <span>{link.label}</span>
        </Link>
      ))}
      <ModeToggle />
    </div>
  );
}
