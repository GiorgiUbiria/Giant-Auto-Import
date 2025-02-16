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
    className={`flex items-center text-white text-nowrap font-medium focus:text-yellow-400 text-lg transition-all hover:text-yellow-400 hover:-translate-y-0.5 ${
      isActive ? "text-yellow-400 font-semibold" : "text-white/90"
    }`}
  >
    <span>{label}</span>
  </Link>
));

NavLink.displayName = "NavLink";

function NavigationLinks({ links }: { links: LinkProp[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-full md:flex-row gap-6 px-8 py-3 bg-black/95 backdrop-blur-sm shadow-lg md:items-center">
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
