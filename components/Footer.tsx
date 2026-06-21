import { Facebook, Instagram, Phone, MapPin } from "lucide-react";
import Logo from "./Logo";
import { BRAND, NAV_LINKS } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="relative bg-midnight py-16 text-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm text-white/55">
              {BRAND.slogan}. A modern community pharmacy serving San Juan,
              Puerto Rico.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-brand-gradient"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-brand-gradient"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/80">Quick Links</p>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/55 transition-colors hover:text-brand-aqua"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/80">Services</p>
            <ul className="mt-4 space-y-2.5">
              {["Prescription Refills", "Vaccines", "WIC", "Delivery"].map(
                (s) => (
                  <li key={s} className="text-sm text-white/55">
                    {s}
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/80">Contact</p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/55">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-aqua" />
                {BRAND.address}
              </li>
              <li className="flex items-center gap-2 text-sm text-white/55">
                <Phone className="h-4 w-4 shrink-0 text-brand-aqua" />
                <a href={BRAND.phoneHref} className="hover:text-brand-aqua">
                  {BRAND.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-xs text-white/40 sm:flex-row">
          <p>© 2026 First Choice Pharmacy. All rights reserved.</p>
          <p>Designed for the San Juan community.</p>
        </div>
      </div>
    </footer>
  );
}
