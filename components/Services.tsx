"use client";

import { motion } from "framer-motion";
import { Pill, Syringe, Truck, Baby, Leaf, Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import { SERVICES, Service } from "@/lib/data";

const ICONS: Record<Service["icon"], typeof Pill> = {
  pill: Pill,
  syringe: Syringe,
  truck: Truck,
  baby: Baby,
  leaf: Leaf,
  sparkles: Sparkles,
};

export default function Services() {
  return (
    <section id="services" className="relative bg-surface-soft py-24 dark:bg-midnight">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="section-badge">What We Offer</span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pharmacy care, modernized
          </h2>
          <p className="mt-4 text-ink/60 dark:text-white/60">
            Everything your family needs, from same-day refills to vaccines,
            handled by a team that knows the neighborhood.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = ICONS[service.icon];
            return (
              <Reveal key={service.title} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="gradient-border glass-card group h-full rounded-4xl p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient-soft transition-colors duration-300 group-hover:bg-brand-gradient">
                    <Icon className="h-6 w-6 text-brand-green-dark transition-colors duration-300 group-hover:text-white dark:text-brand-aqua" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-white/60">
                    {service.description}
                  </p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
