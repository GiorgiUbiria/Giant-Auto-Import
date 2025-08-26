"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useState, useEffect } from "react";
import HeroImageComponent from "./hero-image";

interface HeroProps {
  translations?: {
    title: string;
    subtitle: string;
    startImporting: string;
    howItWorks: string;
  };
}

export default function Hero({ translations }: HeroProps) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = translations?.title || "Giant Auto Import";

  useEffect(() => {
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Start cursor blinking after typing is complete
        const cursorInterval = setInterval(() => {
          setShowCursor(prev => !prev);
        }, 530);
        return () => clearInterval(cursorInterval);
      }
    }, 150);

    return () => clearInterval(typeInterval);
  }, [fullText]);

  return (
    <motion.div
      className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 dark:from-slate-950 dark:via-blue-950 dark:to-blue-900 min-h-[700px] text-white overflow-hidden"
      style={{ y: heroY, opacity: heroOpacity }}
    >
      <HeroImageComponent />

      <motion.div
        className="relative flex flex-col justify-center items-center h-full text-center px-4 pt-20 sm:pt-24 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-max">
          <h1 className="md:text-6xl lg:text-8xl text-4xl mb-6 text-white font-bold">
            <span className="inline-block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {displayText}
              {showCursor && <span className="text-white animate-pulse">|</span>}
            </span>
          </h1>
        </div>

        <motion.p
          className="text-xl text-gray-100 mb-10 max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {translations?.subtitle || "Car Auctions from COPART & IAAI"}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
