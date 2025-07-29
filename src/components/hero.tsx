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
      className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 dark:from-blue-900 dark:via-slate-900 dark:to-black min-h-[700px] text-white overflow-hidden"
      style={{ y: heroY, opacity: heroOpacity }}
    >
      <HeroImageComponent />
      
      <motion.div 
        className="relative flex flex-col justify-center items-center h-full text-center px-4 py-20 z-10"
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
          {translations?.subtitle || "Your trusted partner in importing premium vehicles from Copart USA"}
        </motion.p>
        
        <motion.div 
          className="flex gap-4 flex-wrap justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.a 
            href="#features" 
            className="bg-white text-blue-600 dark:text-blue-800 px-8 py-4 rounded-xl font-semibold shadow-lg backdrop-blur-sm"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              className="inline-flex items-center gap-2"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              {translations?.startImporting || "Start Importing"}
              <motion.svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                initial={{ x: 0 }}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </motion.span>
          </motion.a>
          
          <motion.a 
            href="/how-to" 
            className="border-2 border-white/80 text-white px-8 py-4 rounded-xl font-semibold backdrop-blur-sm"
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,0.1)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            {translations?.howItWorks || "How It Works"}
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
