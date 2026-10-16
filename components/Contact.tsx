"use client";

import { MapPin, Phone, Clock, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import { BRAND, HOURS } from "@/lib/data";

export default function Contact() {
  return (
    <section id="contact" className="relative bg-[#f4f9ff] py-16 text-[#10264e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="section-badge">Visítanos</span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Estamos cerca de ti
          </h2>
        </Reveal>

        <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="flex h-full flex-col gap-6 rounded-3xl border border-sky-100 bg-white p-7 shadow-sm sm:p-9">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e6f5fc]">
                  <MapPin className="h-5 w-5 text-[#0872ad]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Dirección</p>
                  <a
                    href={BRAND.mapsLinkSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm text-ink/60 hover:text-brand-aqua dark:text-white/60"
                  >
                    {BRAND.address}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e6f5fc]">
                  <Phone className="h-5 w-5 text-[#0872ad]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Teléfono</p>
                  <a
                    href={BRAND.phoneHref}
                    className="mt-1 inline-block text-sm text-ink/60 hover:text-brand-aqua dark:text-white/60"
                  >
                    {BRAND.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e6f5fc]">
                  <Clock className="h-5 w-5 text-[#0872ad]" />
                </div>
                <div className="w-full">
                  <p className="text-sm font-semibold">Horario</p>
                  <div className="mt-1.5 space-y-1">
                    {HOURS.map((h) => (
                      <div
                        key={h.day}
                        className="flex justify-between gap-4 text-sm text-slate-600"
                      >
                        <span>{h.day}</span>
                        <span className="font-medium text-slate-800">
                          {h.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <a href={BRAND.phoneHref} className="btn-primary mt-2 w-full">
                <Phone className="h-4 w-4" />
                Llamar ahora
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="h-full min-h-[360px] overflow-hidden rounded-3xl border border-sky-100 shadow-sm">
              <iframe
                title="First Choice Pharmacy location"
                src={BRAND.mapsEmbedSrc}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "360px" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
