"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Reveal from "./Reveal";
import { WHY_CHOOSE } from "@/lib/data";

export default function About() {
  return (
    <section id="about" className="relative bg-[#f3f9fd] py-16 text-[#10264e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="section-badge">Sobre nosotros</span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Tu salud es nuestra prioridad
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06} className="lg:col-span-1 sm:col-span-1">
              <motion.div
                whileHover={{ y: -6 }}
                className="h-full rounded-2xl border border-sky-100 bg-white p-6 shadow-sm"
              >
                <CheckCircle2 className="h-7 w-7 text-brand-green" />
                <h3 className="mt-4 font-display text-base font-bold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-white/60">
                  {item.desc}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
