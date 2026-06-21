# First Choice Pharmacy — Website

A premium, fully responsive marketing site for **First Choice Pharmacy** (San Juan, Puerto Rico), built with Next.js 15, Tailwind CSS, Framer Motion and Lucide Icons.

## What's included

- Sticky glass navbar with mobile menu, dark/light mode toggle
- Animated hero with gradient mesh + floating pill/leaf shapes
- Services grid (glass cards, gradient borders, hover motion)
- Online refill form (with file upload + animated success state)
- Products / categories grid
- Delivery flow illustration (Customer → Pharmacy → Home)
- "Why Choose Us" section
- Contact section with embedded Google Map + hours + call button
- Footer with quick links and social icons
- Floating WhatsApp button
- Branded loading screen, scroll-reveal animations, smooth scrolling
- SEO metadata + JSON-LD `Pharmacy` structured data

## Getting started

You'll need [Node.js](https://nodejs.org) 18.18+ installed.

```bash
# 1. install dependencies
npm install

# 2. run the local dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Project structure

```
app/
  layout.tsx        — fonts, SEO metadata, theme provider, JSON-LD
  page.tsx           — assembles all sections
  globals.css         — design tokens & reusable utility classes
components/
  Navbar.tsx, Hero.tsx, Services.tsx, RefillForm.tsx,
  Products.tsx, Delivery.tsx, About.tsx, Contact.tsx,
  Footer.tsx, WhatsAppButton.tsx, LoadingScreen.tsx,
  ThemeProvider.tsx, ThemeToggle.tsx, Reveal.tsx, Logo.tsx
lib/
  data.ts             — all editable site content (services, products,
                         hours, nav links, address, phone)
```

## Editing content

Almost everything you'll want to change — phone number, address, hours,
services, product categories, "why choose us" copy, nav links — lives in
**`lib/data.ts`**. Edit the text there and it updates across the whole site.

## Things to connect before launch

1. **Refill form backend** — `components/RefillForm.tsx` currently simulates
   a submission (no data is sent anywhere yet). Wire the `handleSubmit`
   function to an API route, Supabase table, or email service (e.g. Resend)
   so refill requests actually reach your team.
2. **WhatsApp number** — confirm `BRAND.whatsappHref` in `lib/data.ts` points
   to the right WhatsApp Business number.
3. **Google Map** — the embed in `Contact.tsx` uses a keyless Google Maps
   embed URL built from your address. For a more polished embed you can
   swap in a Google Maps Embed API key.
4. **Open Graph image** — add a real `public/og.png` (1200×630) for link
   previews on social media; it's already referenced in `app/layout.tsx`.
5. **Domain** — update `siteUrl` in `app/layout.tsx` once your domain is live.

## Deploying to Vercel

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), click **New Project**, and import
   the repo.
3. Vercel auto-detects Next.js — click **Deploy**.
4. Add your custom domain under Project Settings → Domains.

## Tech stack

- [Next.js 15](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev)

---

© 2026 First Choice Pharmacy
