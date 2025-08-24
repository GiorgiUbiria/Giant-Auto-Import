"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useState } from "react";
import { ChevronDown } from "lucide-react";

interface LinkProp {
  href: string;
  label: string;
  isAdminLink?: boolean;
}

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

const AdminDropdown = memo(({ links, isActive }: { links: LinkProp[], isActive: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button
        className={`flex items-center gap-1 font-medium py-3 transition-colors
          ${isActive
            ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
            : "text-black dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border-b-2 border-transparent"}`}
      >
        <span>Admin</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
});

AdminDropdown.displayName = "AdminDropdown";

function NavigationLinks({ links }: { links: LinkProp[] }) {
  const pathname = usePathname();

  // Separate admin links from regular links
  const adminLinks = links.filter(link => link.isAdminLink);
  const regularLinks = links.filter(link => !link.isAdminLink);

  return (
    <div className="flex items-center gap-8">
      {regularLinks.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          label={link.label}
          isActive={pathname === link.href}
        />
      ))}
      {adminLinks.length > 0 && (
        <AdminDropdown
          links={adminLinks}
          isActive={adminLinks.some(link => pathname === link.href)}
        />
      )}
    </div>
  );
}

export default memo(NavigationLinks);
