// Client-safe catalog helpers shared by storefront components.

export const CATEGORY_EMOJI: Record<string, string> = {
  "medicamentos-otc": "💊",
  "vitaminas-suplementos": "🌿",
  "primeros-auxilios": "🩹",
  "equipo-medico": "🏥",
  "dolor-muscular": "💪",
  "salud-ocular-nasal": "👁️",
  "bebe-mama": "👶",
  "vitaminas-infantiles": "🧸",
  "productos-naturales": "🌱",
  "grocery-alimentos": "🛒",
  "leches-bebidas": "🥛",
  "snacks-dulces": "🍿",
  "refrescos-agua": "🥤",
  "juguetes-regalos": "🎁",
};

export function categoryEmoji(slug: string | null | undefined): string {
  return (slug && CATEGORY_EMOJI[slug]) || "🛍️";
}

export function isTrustedProductImage(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "vhwpotmsdmaqizkvgowl.supabase.co" &&
      url.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
