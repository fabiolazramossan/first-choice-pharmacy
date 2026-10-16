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
    <section id="services" className="relative bg-[#f4f9ff] py-16 text-[#10264e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="section-badge">Nuestros servicios</span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Cuidamos de ti y tu familia
          </h2>
          <p className="mt-4 text-ink/60 dark:text-white/60">
            Recetas, vacunación, WIC y productos para tu bienestar, con atención cercana en San Juan.
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
                  className="group h-full rounded-2xl border border-sky-100 bg-white p-6 shadow-sm hover:shadow-lg"
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
