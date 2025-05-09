"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";

interface LinkProp {
  href: string;
  label: string;
}

// Memoized link component to prevent unnecessary re-renders
const NavLink = memo(({ href, label, isActive }: LinkProp & { isActive: boolean }) => (
  <Link
    href={href}
    prefetch
    className={`flex items-center text-nowrap font-medium py-3 transition-colors
      ${isActive 
        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" 
        : "text-black dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border-b-2 border-transparent"}`}
  >
    <span>{label}</span>
  </Link>
));

NavLink.displayName = "NavLink";

function NavigationLinks({ links }: { links: LinkProp[] }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-8">
      {links.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          isActive={pathname === link.href}
        />
      ))}
    </div>
  );
}

export default memo(NavigationLinks);
