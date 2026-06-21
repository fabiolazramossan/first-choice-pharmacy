"use client";

import { motion } from "framer-motion";
import { ArrowRight, Phone, Pill, Leaf, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/data";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-surface pb-20 pt-32 sm:pt-40 lg:pb-28 dark:bg-midnight"
    >
      {/* Gradient mesh background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-mesh opacity-90 dark:opacity-60" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-surface/40 dark:bg-midnight/60" />

      {/* Floating decorative shapes */}
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[6%] top-28 hidden h-16 w-16 items-center justify-center rounded-3xl bg-white/80 shadow-soft-lg backdrop-blur-xl sm:flex dark:bg-white/10"
      >
        <Pill className="h-7 w-7 text-brand-green" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 16, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="absolute right-[8%] top-44 hidden h-14 w-14 items-center justify-center rounded-full bg-white/80 shadow-soft-lg backdrop-blur-xl sm:flex dark:bg-white/10"
      >
        <Leaf className="h-6 w-6 text-brand-aqua" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
        className="absolute bottom-16 left-[14%] hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-soft backdrop-blur-xl md:flex dark:bg-white/10"
      >
        <Sparkles className="h-5 w-5 text-brand-red" />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[18%] bottom-10 hidden h-24 w-24 rounded-full bg-brand-aqua/30 blur-2xl md:block"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute left-[20%] top-20 hidden h-28 w-28 rounded-full bg-brand-green/30 blur-2xl md:block"
      />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 text-center sm:px-8">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-badge"
        >
          San Juan, Puerto Rico
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 max-w-3xl font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Your Health
          <span className="block text-gradient">Starts Here</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-xl text-balance text-base text-ink/65 sm:text-lg dark:text-white/65"
        >
          Fast prescriptions, vaccines, wellness products and personalized
          care in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <a href="#refill" className="btn-primary">
            Refill Prescription
            <ArrowRight className="h-4 w-4" />
          </a>
          <a href={BRAND.phoneHref} className="btn-secondary">
            <Phone className="h-4 w-4" />
            Call Now
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-3 sm:gap-5"
        >
          {[
            { value: "7", label: "Days a week open" },
            { value: "WIC", label: "Approved location" },
            { value: "100%", label: "Local & community-run" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-3xl px-3 py-5 sm:px-5"
            >
              <p className="font-display text-xl font-bold text-ink sm:text-2xl dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] leading-tight text-ink/55 sm:text-xs dark:text-white/55">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
