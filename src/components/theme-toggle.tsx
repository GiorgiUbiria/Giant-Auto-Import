"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { setTheme, theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <div className="flex gap-2 text-primary dark:text-white">
      <Button
        onClick={() => setTheme("light")}
        size="icon"
        className={cn(
          "transition-colors duration-300 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800",
          currentTheme === "light" ? "bg-yellow-500 dark:bg-yellow-600 text-white dark:text-white" : ""
        )}
        aria-label="Switch to light mode"
      >
        <Sun
          className="h-[1.2rem] w-[1.2rem] transition-transform duration-300 ease-in-out"
        />
      </Button>

      <Button
        onClick={() => setTheme("dark")}
        size="icon"
        className={cn(
          "transition-colors duration-300 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800",
          currentTheme === "dark" ? "bg-blue-900 dark:bg-blue-800 text-white dark:text-white" : ""
        )}
        aria-label="Switch to dark mode"
      >
        <Moon
          className="h-[1.2rem] w-[1.2rem] transition-transform duration-300 ease-in-out"
        />
      </Button>
    </div>
  );
}
