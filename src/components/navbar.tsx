"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useCallback } from "react";
import CopartLogo from "../../public/copart-logo.png";
import IAAILogo from "../../public/iaai-logo.png";
import NavbarLogoDark from "../../public/giant_logo_dark.png";
import NavbarLogoWhite from "../../public/giant_logo_white.png";
import LocaleSwitcher from "./LocaleSwitcher";
import Avatar from "./avatar";
import NavigationLinks, { ICON_MAP, NavigationLink } from "./navigation-links";

// Client component for mobile menu
const MobileMenu = ({ links }: { links: NavigationLink[] }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 h-10 w-10 md:hidden rounded-md border-gray-200 dark:border-gray-700"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-72">
        <div className="flex flex-col gap-6 pt-6">
          <Link href="/" className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <Image
                src={NavbarLogoDark}
                alt="Company logo"
                fill
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src={NavbarLogoWhite}
                alt="Company logo"
                fill
                className="object-contain hidden dark:block"
                priority
              />
            </div>
          </Link>
          <nav className="flex flex-col space-y-1">
            {links.map((link) => {
              const IconComponent = link.icon;
              return (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 text-gray-800 dark:text-gray-200 font-medium 
                      text-base py-3 px-4 rounded-md transition-colors hover:bg-gray-100 
                      dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
          <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-center">
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface NavbarProps {
  user: any; // Replace with proper user type
  translations: {
    navbar: Record<string, string>;
    howTo: Record<string, string>;
  };
}

// Client Component
const Navbar = ({ user, translations }: NavbarProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations("Navbar");
  const tHowTo = useTranslations("HowTo");

  const resetVisibilityTimeout = useCallback(() => {
    setIsVisible(true);
    if (scrollTimer.current !== null) {
      clearTimeout(scrollTimer.current);
    }
    scrollTimer.current = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsVisible(true);
    if (scrollTimer.current !== null) {
      clearTimeout(scrollTimer.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    resetVisibilityTimeout();
  }, [resetVisibilityTimeout]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY && window.innerWidth <= 640) {
        setIsVisible(true);
        resetVisibilityTimeout();
      }
      lastScrollY = currentScrollY;
    };

    if (window.innerWidth <= 640) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [resetVisibilityTimeout]);

  const baseLinks: NavigationLink[] = [
    { href: "/", label: t("home"), icon: ICON_MAP.home },
    { href: "/contact", label: t("contact"), icon: ICON_MAP.contact },
    { href: "/about", label: t("about"), icon: ICON_MAP.about },
    { href: "/calculator", label: t("calculator"), icon: ICON_MAP.calculator },
    { href: "/how-to", label: tHowTo("navbar"), icon: ICON_MAP.extension },
  ];

  const adminLinks: NavigationLink[] = user?.role === "ADMIN" ? [
    { href: "/admin", label: t("admin_panel"), icon: ICON_MAP.admin }
  ] : [];

  const customerLinks: NavigationLink[] = user?.role?.includes("CUSTOMER") ? [
    { href: "/dashboard", label: t("dashboard"), icon: ICON_MAP.dashboard }
  ] : [];

  const navigationLinks = [...baseLinks, ...adminLinks, ...customerLinks];

  const headerClassName = `fixed top-0 left-0 right-0 w-full md:relative md:top-0 flex items-center gap-4 z-50 ${isVisible ? "" : "header-hidden"}`;

  return (
    <div className="w-full shadow-md">
      <header
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={headerClassName}
      >
        <div className="w-full bg-white dark:bg-gradient-to-r dark:from-slate-950 dark:to-blue-800 shadow-md transition-colors duration-300">
          {/* Upper Navbar */}
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <div className="flex items-center gap-4">
                <MobileMenu links={navigationLinks} />
                <Link href="/" className="flex items-center" prefetch>
                  <div className="relative w-24 h-24 sm:w-24 sm:h-24 lg:w-40 lg:h-40">
                    <Image
                      src={NavbarLogoDark}
                      alt="Company logo"
                      fill
                      className="object-contain dark:hidden"
                      priority
                    />
                    <Image
                      src={NavbarLogoWhite}
                      alt="Company logo"
                      fill
                      className="object-contain hidden dark:block"
                      priority
                    />
                  </div>

                </Link>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="https://www.copart.com/login/"
                  className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={CopartLogo}
                    alt="Copart logo"
                    className="size-16 sm:size-20 lg:size-24 dark:brightness-95"
                    priority
                  />
                </Link>
                <Link
                  href="https://login.iaai.com/"
                  className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={IAAILogo}
                    alt="IAAI logo"
                    className="size-16 sm:size-20 lg:size-24 dark:brightness-95"
                    priority
                  />
                </Link>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <LocaleSwitcher />
                <Avatar user={user} />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block border-t border-gray-200 dark:border-gray-800 bg-gray-200 dark:bg-slate-950">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              <NavigationLinks links={navigationLinks} />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
