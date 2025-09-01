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
      className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 dark:from-slate-950 dark:via-blue-950 dark:to-blue-900 min-h-[800px] text-white overflow-hidden"
      style={{
        y: heroY,
        opacity: heroOpacity,
        aspectRatio: '16/9', // Standard aspect ratio
        minHeight: '100vh', // Full viewport height
      }}
    >
      <HeroImageComponent />

      <motion.div
        className="relative flex flex-col justify-start items-center h-full text-center px-4 pt-16 sm:pt-20 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-max mt-8">
          <h1 className="md:text-6xl lg:text-8xl text-4xl mb-4 text-white font-bold">
            <span className="inline-block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {displayText}
              {showCursor && <span className="text-white animate-pulse">|</span>}
            </span>
          </h1>
        </div>

        <motion.p
          className="text-xl text-gray-100 mb-8 max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {translations?.subtitle || "Car Auctions from COPART & IAAI"}
        </motion.p>

        {/* Text Cards */}
        <div className="mt-8 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          {/* Card 1: Deposit */}
          <motion.div
            className="bg-blue-900/80 dark:bg-blue-950/90 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-blue-800/50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-orange-400 mb-2">1. Deposit</h3>
              <div className="space-y-2 text-orange-300">
                <p className="font-semibold">Copart 10% min 600$</p>
                <p className="font-semibold">IAAI 15% min 1,000$</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Find your Car */}
          <motion.div
            className="bg-blue-900/80 dark:bg-blue-950/90 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-blue-800/50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-orange-400 mb-2">2. Find your Car</h3>
              <p className="text-orange-300">
                Search our inventory of more than 500,000 used & repairable vehicles
              </p>
            </div>
          </motion.div>

          {/* Card 3: Start Bidding */}
          <motion.div
            className="bg-blue-900/80 dark:bg-blue-950/90 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-blue-800/50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-orange-400 mb-2">3. Start Bidding</h3>
              <p className="text-orange-300">
                Bid on daily auto auctions Monday-Friday
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
