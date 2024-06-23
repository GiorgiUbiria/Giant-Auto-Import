"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import "../lib/header.css";

export default function DynamicHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    setIsVisible(true);
    if (scrollTimer.current !== null) {
      clearTimeout(scrollTimer.current);
    }
  }, []);

  const resetScrollTimeout = useCallback(() => {
    setIsVisible(true);
    if (scrollTimer.current !== null) {
      clearTimeout(scrollTimer.current);
    }
    scrollTimer.current = setTimeout(() => {
      setIsVisible(false);
    }, 3500);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isScrolledUp) {
      resetScrollTimeout();
    }
  }, [isScrolledUp, resetScrollTimeout]);

  useEffect(() => {
    if (screen.width <= 640) {
      let lastScrollY = window.scrollY;

      const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < lastScrollY) {
          setIsScrolledUp(true);
          setIsVisible(true);
          resetScrollTimeout();
        } else {
          setIsScrolledUp(false);
        }

        lastScrollY = currentScrollY;
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollTimer.current !== null) {
          clearTimeout(scrollTimer.current);
        }
      };
    } else {
      setIsVisible(true);
      setIsScrolledUp(true);
      return () => {};
    }
  }, [resetScrollTimeout]);

  return (
    <header
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`fixed bottom-0 left-0 right-0 md:relative md:top-0 flex h-20 items-center gap-4 bg-muted z-10 px-4 md:px-6 shadow-blac-5 ${isScrolledUp && isVisible ? "header-visible" : "header-hidden"}`}
    >
      {children}
    </header>
  );
}
