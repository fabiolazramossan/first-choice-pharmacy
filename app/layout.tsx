import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/components/CartProvider";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://first-choice-pharmacy.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "First Choice Pharmacy | Farmacia en San Juan, Puerto Rico",
    template: "%s | First Choice Pharmacy",
  },
  description:
    "Farmacia comunitaria en San Juan, Puerto Rico con refills, vacunas, WIC, delivery y productos de bienestar.",
  keywords: [
    "pharmacy San Juan",
    "Puerto Rico pharmacy",
    "prescription refill",
    "vaccines San Juan",
    "WIC pharmacy Puerto Rico",
    "pharmacy delivery PR",
  ],
  openGraph: {
    title: "First Choice Pharmacy | Tu salud es nuestra prioridad",
    description:
      "Refills, vacunas, WIC, delivery y productos de bienestar en San Juan, Puerto Rico.",
    url: siteUrl,
    siteName: "First Choice Pharmacy",
    locale: "es_PR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "First Choice Pharmacy | Tu salud es nuestra prioridad",
    description:
      "Refills, vacunas, WIC, delivery y productos de bienestar en San Juan.",
  },
  alternates: { canonical: siteUrl },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Pharmacy",
    name: "First Choice Pharmacy",
    image: `${siteUrl}/logo.png`,
    telephone: "+1-787-751-6646",
    address: {
      "@type": "PostalAddress",
      streetAddress: "86 C. Georgetti",
      addressLocality: "San Juan",
      addressRegion: "PR",
      postalCode: "00926",
      addressCountry: "US",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "10:00",
        closes: "17:00",
      },
    ],
  };

  return (
    <html lang="es" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
