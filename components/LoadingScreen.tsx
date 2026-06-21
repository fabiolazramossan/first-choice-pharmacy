"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-midnight"
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-gradient shadow-glow-green"
            >
              <motion.div
                animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.15, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-3xl bg-brand-gradient blur-xl"
              />
              <svg width="28" height="34" viewBox="0 0 28 34" fill="none" className="relative">
                <rect x="2" y="2" width="24" height="30" rx="12" fill="white" fillOpacity="0.95" />
                <rect x="2" y="15" width="24" height="4.5" fill="#2EC4FF" />
              </svg>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="font-display text-sm font-semibold tracking-[0.18em] text-ink/60 dark:text-white/60"
            >
              FIRST CHOICE PHARMACY
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
