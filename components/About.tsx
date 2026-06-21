"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Reveal from "./Reveal";
import { WHY_CHOOSE } from "@/lib/data";

export default function About() {
  return (
    <section id="about" className="relative bg-surface-soft py-24 dark:bg-midnight">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="section-badge">About Us</span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Why Choose First Choice?
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {WHY_CHOOSE.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06} className="lg:col-span-1 sm:col-span-1">
              <motion.div
                whileHover={{ y: -6 }}
                className="glass-card h-full rounded-4xl p-6"
              >
                <CheckCircle2 className="h-7 w-7 text-brand-green" />
                <h3 className="mt-4 font-display text-base font-bold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-white/60">
                  {item.description}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
