"use client";

import { motion } from "framer-motion";
import { User, Building2, Home, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { BRAND } from "@/lib/data";

const STEPS = [
  { icon: User, label: "Customer", note: "Request your refill online" },
  { icon: Building2, label: "Pharmacy", note: "We prepare it the same day" },
  { icon: Home, label: "Home Delivery", note: "Delivered to your door" },
];

export default function Delivery() {
  return (
    <section id="delivery" className="relative overflow-hidden bg-surface py-24 dark:bg-midnight">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-10">
          <Reveal>
            <span className="section-badge">Delivery</span>
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Convenient delivery service to your doorstep
            </h2>
            <p className="mt-4 max-w-md text-ink/60 dark:text-white/60">
              No need to leave home. Once your prescription or order is
              ready, our team brings it straight to you, anywhere in our San
              Juan delivery area.
            </p>
            <a href="#refill" className="btn-primary mt-8 w-fit">
              Order Now
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass-card relative rounded-5xl p-8 sm:p-10">
              <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
                {STEPS.map((step, i) => (
                  <div
                    key={step.label}
                    className="relative flex flex-1 flex-col items-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.15 }}
                      className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-gradient shadow-glow-green"
                    >
                      <step.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <p className="mt-4 font-display text-sm font-bold">
                      {step.label}
                    </p>
                    <p className="mt-1 max-w-[9rem] text-xs text-ink/55 dark:text-white/55">
                      {step.note}
                    </p>
                  </div>
                ))}

                {/* connecting line + traveling dot, desktop only */}
                <div className="pointer-events-none absolute left-[18%] right-[18%] top-[2.6rem] hidden h-px bg-gradient-to-r from-brand-green via-brand-aqua to-brand-green sm:block">
                  <motion.div
                    animate={{ left: ["0%", "100%"] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1.5 h-3 w-3 rounded-full bg-white shadow-glow"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-surface-soft px-4 py-3 text-center text-xs text-ink/55 dark:bg-white/[0.04] dark:text-white/55">
                Delivering across San Juan from {BRAND.address}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
