"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useState, useCallback, useMemo } from "react";
import {
  HomeIcon,
  EnvelopeClosedIcon,
  InfoCircledIcon,
  PlusIcon,
  PersonIcon,
  GearIcon,
  FileTextIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from "@radix-ui/react-icons";

// Enhanced types for better type safety
interface NavigationLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  isAdminLink?: boolean;
  isExternal?: boolean;
  badge?: string;
  disabled?: boolean;
}

// Icon mapping for consistent icon usage
const ICON_MAP = {
  home: HomeIcon,
  contact: EnvelopeClosedIcon,
  about: InfoCircledIcon,
  calculator: PlusIcon, // Using PlusIcon as a placeholder for calculator
  dashboard: HomeIcon, // Using HomeIcon as a placeholder for dashboard
  cars: FileTextIcon, // Using FileTextIcon as a placeholder for cars
  addCar: PlusIcon,
  users: PersonIcon,
  admin: GearIcon,
  csv: FileTextIcon,
} as const;

// Enhanced NavLink component with better accessibility and animations
const NavLink = memo(({
  link,
  isActive,
  isExpanded
}: {
  link: NavigationLink;
  isActive: boolean;
  isExpanded?: boolean;
}) => {
  const IconComponent = link.icon;

  return (
    <Link
      href={link.href}
      prefetch={!link.isExternal}
      className={`
        group relative flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200
        ${isActive
          ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
        }
        ${link.disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
        ${isExpanded ? "min-w-fit" : "w-10 justify-center"}
      `}
      aria-current={isActive ? "page" : undefined}
      title={!isExpanded ? link.label : undefined}
    >
      <IconComponent
        className={`
          h-4 w-4 flex-shrink-0 transition-transform duration-200
          ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}
          ${isExpanded ? "group-hover:scale-110" : ""}
        `}
      />

      {isExpanded && (
        <span className="font-medium text-sm whitespace-nowrap">{link.label}</span>
      )}

      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
      )}
    </Link>
  );
});

NavLink.displayName = "NavLink";

// Enhanced AdminDropdown with better UX
const AdminDropdown = memo(({
  links,
  isActive,
  isExpanded
}: {
  links: NavigationLink[];
  isActive: boolean;
  isExpanded?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);
  const handleMouseEnter = useCallback(() => setIsOpen(true), []);
  const handleMouseLeave = useCallback(() => setIsOpen(false), []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleToggle}
        className={`
          group relative flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200
          ${isActive
            ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
          }
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <GearIcon className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />

        {isExpanded && (
          <>
            <span className="flex-1 text-left font-medium text-sm">Admin</span>
            <ChevronDownIcon
              className={`
                h-4 w-4 flex-shrink-0 transition-transform duration-200
                ${isOpen ? "rotate-180" : ""}
              `}
            />
          </>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-150"
            >
              <link.icon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              <span className="font-medium">{link.label}</span>
              {link.description && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  {link.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
});

AdminDropdown.displayName = "AdminDropdown";

// Enhanced path matching with better edge case handling
const isPathActive = (currentPath: string, linkPath: string): boolean => {
  // Normalize paths by removing trailing slashes and converting to lowercase
  const normalizedCurrentPath = currentPath.replace(/\/$/, '').toLowerCase();
  const normalizedLinkPath = linkPath.replace(/\/$/, '').toLowerCase();

  // Exact match
  if (normalizedCurrentPath === normalizedLinkPath) {
    return true;
  }

  // Handle root path specially
  if (linkPath === '/' && (normalizedCurrentPath === '' || normalizedCurrentPath === '/')) {
    return true;
  }

  // Handle nested routes (e.g., /admin/users should be active when on /admin)
  if (linkPath !== '/' && normalizedCurrentPath.startsWith(normalizedLinkPath + '/')) {
    return true;
  }

  // Handle query parameters
  if (normalizedCurrentPath.split('?')[0] === normalizedLinkPath) {
    return true;
  }

  return false;
};

// Main NavigationLinks component with better performance and UX
function NavigationLinks({
  links,
  isExpanded = true,
  className = ""
}: {
  links: NavigationLink[];
  isExpanded?: boolean;
  className?: string;
}) {
  const pathname = usePathname();

  // Memoize filtered links for better performance
  const { adminLinks, regularLinks } = useMemo(() => ({
    adminLinks: links.filter(link => link.isAdminLink),
    regularLinks: links.filter(link => !link.isAdminLink)
  }), [links]);

  // Memoize active states to prevent unnecessary re-renders
  const activeStates = useMemo(() => ({
    regular: regularLinks.map(link => isPathActive(pathname, link.href)),
    admin: adminLinks.some(link => isPathActive(pathname, link.href))
  }), [pathname, regularLinks, adminLinks]);

  return (
    <nav className={`flex items-center justify-start gap-1 ${className}`}>
      {/* Regular navigation links */}
      <div className="flex items-center gap-1">
        {regularLinks.map((link, index) => (
          <NavLink
            key={link.href}
            link={link}
            isActive={activeStates.regular[index]}
            isExpanded={isExpanded}
          />
        ))}
      </div>

      {/* Admin dropdown */}
      {adminLinks.length > 0 && (
        <div className="ml-2">
          <AdminDropdown
            links={adminLinks}
            isActive={activeStates.admin}
            isExpanded={isExpanded}
          />
        </div>
      )}
    </nav>
  );
}

export default memo(NavigationLinks);

// Export types for external use
export type { NavigationLink };
export { ICON_MAP };
