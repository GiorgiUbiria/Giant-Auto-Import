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
    <div className="flex flex-col w-full md:flex-row gap-6 pl-8 py-1 md:bg-black shadow-2xl md:items-center">
      {links.map((link) => (
        <Link
          href={link.href}
          key={link.href}
          className={`flex items-center text-black dark:text-white dark:focus-text-yellow-300 text-nowrap font-semibold focus:text-yellow-300 text-2xl md:text-lg transition-colors hover:text-yellow-500 dark:hover:text-yellow-500 ${
            pathname === link.href
              ? "font-bold text-yellow-300 dark:text-yellow-300"
              : "text-white font-medium"
          }`}
        >
          <span>{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
