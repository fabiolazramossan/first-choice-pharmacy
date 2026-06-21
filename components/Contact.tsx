"use client";

import { MapPin, Phone, Clock, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import { BRAND, HOURS } from "@/lib/data";

export default function Contact() {
  return (
    <section id="contact" className="relative bg-surface py-24 dark:bg-midnight">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="section-badge">Visit or Call</span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            We&apos;re right around the corner
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="glass-card flex h-full flex-col gap-6 rounded-5xl p-7 sm:p-9">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft">
                  <MapPin className="h-5 w-5 text-brand-green-dark dark:text-brand-aqua" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Address</p>
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
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft">
                  <Phone className="h-5 w-5 text-brand-green-dark dark:text-brand-aqua" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Phone</p>
                  <a
                    href={BRAND.phoneHref}
                    className="mt-1 inline-block text-sm text-ink/60 hover:text-brand-aqua dark:text-white/60"
                  >
                    {BRAND.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft">
                  <Clock className="h-5 w-5 text-brand-green-dark dark:text-brand-aqua" />
                </div>
                <div className="w-full">
                  <p className="text-sm font-semibold">Hours</p>
                  <div className="mt-1.5 space-y-1">
                    {HOURS.map((h) => (
                      <div
                        key={h.day}
                        className="flex justify-between gap-4 text-sm text-ink/60 dark:text-white/60"
                      >
                        <span>{h.day}</span>
                        <span className="font-medium text-ink/80 dark:text-white/80">
                          {h.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <a href={BRAND.phoneHref} className="btn-primary mt-2 w-full">
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="h-full min-h-[360px] overflow-hidden rounded-5xl border border-ink/5 shadow-card dark:border-white/10">
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
