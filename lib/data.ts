export const BRAND = {
  name: "First Choice Pharmacy",
  slogan: "Your Health, Your First Choice",
  phone: "787-751-6646",
  phoneHref: "tel:+17877516646",
  whatsappHref: "https://wa.me/17877516646",
  address: "86 C. Georgetti, San Juan, PR 00926",
  mapsEmbedSrc:
    "https://www.google.com/maps?q=86+C.+Georgetti,+San+Juan,+PR+00926&output=embed",
  mapsLinkSrc:
    "https://www.google.com/maps/search/?api=1&query=86+C.+Georgetti,+San+Juan,+PR+00926",
};

export const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Refill", href: "#refill" },
  { label: "Products", href: "#products" },
  { label: "Delivery", href: "#delivery" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const HOURS = [
  { day: "Monday – Friday", time: "7:00 AM – 7:00 PM" },
  { day: "Saturday", time: "8:00 AM – 6:00 PM" },
  { day: "Sunday", time: "10:00 AM – 5:00 PM" },
];

export type Service = {
  icon: "pill" | "syringe" | "truck" | "baby" | "leaf" | "sparkles";
  title: string;
  description: string;
};

export const SERVICES: Service[] = [
  {
    icon: "pill",
    title: "Prescription Refills",
    description:
      "Submit refills online and pick up in-store or have them delivered, whichever fits your day.",
  },
  {
    icon: "syringe",
    title: "Vaccines",
    description:
      "Flu, COVID-19 and routine immunizations administered by our licensed pharmacy team.",
  },
  {
    icon: "truck",
    title: "Delivery",
    description:
      "Local delivery across San Juan, so your medication reaches you without the trip.",
  },
  {
    icon: "baby",
    title: "WIC",
    description:
      "WIC-approved items and guidance for families enrolled in the program.",
  },
  {
    icon: "leaf",
    title: "Wellness",
    description:
      "Vitamins, supplements and everyday wellness essentials curated for your routine.",
  },
  {
    icon: "sparkles",
    title: "Personal Care",
    description:
      "Skin care, baby care and personal care products from trusted brands, in stock.",
  },
];

export type ProductCategory = {
  name: string;
  blurb: string;
  icon: "vitamins" | "baby" | "skin" | "perfume" | "otc" | "snacks";
  tint: "green" | "aqua" | "red";
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    name: "Vitamins",
    blurb: "Daily multivitamins, immune support & more",
    icon: "vitamins",
    tint: "green",
  },
  {
    name: "Baby & Mom",
    blurb: "Feeding, diapering and maternity essentials",
    icon: "baby",
    tint: "aqua",
  },
  {
    name: "Skin Care",
    blurb: "Cleansers, moisturizers and SPF for every skin type",
    icon: "skin",
    tint: "green",
  },
  {
    name: "Perfumes",
    blurb: "Signature fragrances for men and women",
    icon: "perfume",
    tint: "red",
  },
  {
    name: "OTC Medications",
    blurb: "Pain relief, allergy, cold & flu essentials",
    icon: "otc",
    tint: "aqua",
  },
  {
    name: "Snacks",
    blurb: "Grab-and-go snacks for the whole family",
    icon: "snacks",
    tint: "green",
  },
];

export const WHY_CHOOSE = [
  {
    title: "Trusted Care",
    description:
      "A licensed pharmacy team that knows your name and your history, not just your prescription number.",
  },
  {
    title: "Experienced Team",
    description:
      "Pharmacists and technicians with deep roots in the San Juan community we serve.",
  },
  {
    title: "Fast Service",
    description:
      "Streamlined refills and a real queue you can track, so waiting isn't part of the visit.",
  },
  {
    title: "Modern Solutions",
    description:
      "Online refills, digital records and delivery built around how you actually live.",
  },
  {
    title: "Community Focus",
    description:
      "Proudly local, supporting WIC families and neighbors across Puerto Rico every day.",
  },
];
