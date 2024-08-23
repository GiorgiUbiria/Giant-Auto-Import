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
    <div className="flex gap-2 text-primary">
      <Button
        onClick={() => setTheme("light")}
        size="icon"
        className={cn(
          "transition-colors duration-300",
          currentTheme === "light" ? "bg-yellow-500" : "bg-transparent text-white"
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
          "transition-colors duration-300",
          currentTheme === "dark" ? "bg-blue-900 text-white" : "bg-transparent"
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
