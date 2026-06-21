import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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

const siteUrl = "https://www.firstchoicepharmacypr.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "First Choice Pharmacy | Your Health, Your First Choice",
    template: "%s | First Choice Pharmacy",
  },
  description:
    "First Choice Pharmacy is a modern community pharmacy in San Juan, Puerto Rico offering prescription refills, vaccines, WIC, delivery and wellness products.",
  keywords: [
    "pharmacy San Juan",
    "Puerto Rico pharmacy",
    "prescription refill",
    "vaccines San Juan",
    "WIC pharmacy Puerto Rico",
    "pharmacy delivery PR",
  ],
  openGraph: {
    title: "First Choice Pharmacy | Your Health, Your First Choice",
    description:
      "Fast prescriptions, vaccines, wellness products and personalized care in one place. Serving San Juan, Puerto Rico.",
    url: siteUrl,
    siteName: "First Choice Pharmacy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "First Choice Pharmacy | Your Health, Your First Choice",
    description:
      "Fast prescriptions, vaccines, wellness products and personalized care in one place.",
  },
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
    image: `${siteUrl}/og.png`,
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
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
