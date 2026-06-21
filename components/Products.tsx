"use client";

import { motion } from "framer-motion";
import {
  Pill,
  Baby,
  Droplets,
  SprayCan,
  Stethoscope,
  Cookie,
  ArrowUpRight,
} from "lucide-react";
import Reveal from "./Reveal";
import { PRODUCT_CATEGORIES, ProductCategory } from "@/lib/data";

const ICONS: Record<ProductCategory["icon"], typeof Pill> = {
  vitamins: Pill,
  baby: Baby,
  skin: Droplets,
  perfume: SprayCan,
  otc: Stethoscope,
  snacks: Cookie,
};

const TINTS: Record<ProductCategory["tint"], string> = {
  green: "from-brand-green/25 to-brand-green/0",
  aqua: "from-brand-aqua/25 to-brand-aqua/0",
  red: "from-brand-red/20 to-brand-red/0",
};

const ICON_TINTS: Record<ProductCategory["tint"], string> = {
  green: "text-brand-green-dark dark:text-brand-green",
  aqua: "text-brand-aqua-dark dark:text-brand-aqua",
  red: "text-brand-red",
};

export default function Products() {
  return (
    <section id="products" className="relative bg-surface-soft py-24 dark:bg-midnight">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="section-badge">In-Store &amp; Online</span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Shop wellness, made simple
          </h2>
          <p className="mt-4 text-ink/60 dark:text-white/60">
            From everyday vitamins to baby essentials, browse what we carry
            by category.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_CATEGORIES.map((cat, i) => {
            const Icon = ICONS[cat.icon];
            return (
              <Reveal key={cat.name} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.015 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="group relative h-56 overflow-hidden rounded-4xl border border-ink/5 bg-white shadow-card dark:border-white/10 dark:bg-midnight-card"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${TINTS[cat.tint]} opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  <div
                    aria-hidden
                    className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/40 blur-2xl transition-transform duration-500 group-hover:scale-125 dark:bg-white/5"
                  />
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-soft backdrop-blur-md dark:bg-white/10">
                        <Icon className={`h-6 w-6 ${ICON_TINTS[cat.tint]}`} />
                      </div>
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-white/10"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </motion.div>
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold">
                        {cat.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-ink/60 dark:text-white/60">
                        {cat.blurb}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
