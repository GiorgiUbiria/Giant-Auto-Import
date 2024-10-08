"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function DynamicHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

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

  const className = `fixed top-0 left-0 right-0 md:relative md:top-0 flex h-20 items-center gap-4 dark:bg-gratient-to-r dark:from-darkbg dark:to-darkfg bg-gradient-to-r from-darkbg to-darkfg z-10 px-4 md:px-6 shadow-blac-5 ${isVisible ? "" : "header-hidden"}`;

  return (
    <header
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </header>
  );
}
