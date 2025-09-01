"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";
import {
  HomeIcon,
  EnvelopeClosedIcon,
  InfoCircledIcon,
  GearIcon,
  GridIcon,
  Component1Icon
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
  calculator: GridIcon, // Grid icon for calculator functionality
  extension: Component1Icon, // Component icon for how-to/extension links
  dashboard: HomeIcon, // Using HomeIcon as a placeholder for dashboard
  admin: GearIcon,
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

  // Memoize active states to prevent unnecessary re-renders
  const activeStates = useMemo(() =>
    links.map(link => isPathActive(pathname, link.href)),
    [pathname, links]
  );

  return (
    <nav className={`flex items-center justify-start gap-1 ${className}`}>
      {/* All navigation links */}
      <div className="flex items-center gap-1">
        {links.map((link, index) => (
          <NavLink
            key={link.href}
            link={link}
            isActive={activeStates[index]}
            isExpanded={isExpanded}
          />
        ))}
      </div>
    </nav>
  );
}

export default memo(NavigationLinks);

// Export types for external use
export type { NavigationLink };
export { ICON_MAP };
