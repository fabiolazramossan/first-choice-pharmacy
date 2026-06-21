"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { BRAND, NAV_LINKS } from "@/lib/data";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-pill border px-4 py-2.5 transition-all duration-300 sm:px-5 ${
          scrolled
            ? "border-ink/10 bg-white/80 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-midnight/80"
            : "border-transparent bg-white/40 backdrop-blur-md dark:bg-white/[0.03]"
        }`}
      >
        <a href="#top" className="shrink-0">
          <Logo />
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-brand-aqua dark:text-white/70 dark:hover:text-brand-aqua"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <a href={BRAND.phoneHref} className="btn-secondary !px-5 !py-2.5">
            <Phone className="h-4 w-4" />
            Call Now
          </a>
          <a href="#refill" className="btn-primary !px-5 !py-2.5">
            Refill Prescription
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white/70 dark:border-white/15 dark:bg-white/5"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mx-auto mt-2 max-w-6xl rounded-4xl border border-ink/10 bg-white/95 p-5 shadow-soft-lg backdrop-blur-xl dark:border-white/10 dark:bg-midnight/95 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-3 py-3 text-base font-medium text-ink/80 transition-colors hover:bg-brand-green/10 hover:text-brand-green-dark dark:text-white/80 dark:hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-ink/10 pt-4 dark:border-white/10">
              <a href={BRAND.phoneHref} className="btn-secondary w-full">
                <Phone className="h-4 w-4" />
                Call Now
              </a>
              <a href="#refill" onClick={() => setOpen(false)} className="btn-primary w-full">
                Refill Prescription
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
