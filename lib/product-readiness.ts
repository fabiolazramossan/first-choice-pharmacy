// Publication readiness: the single definition of what a product needs before
// it can be published. Used by the admin API (enforced) and the admin editor
// (shown as a checklist), and unit-tested in tests/product-readiness.test.mjs.

export type ReadinessInput = {
  name: string;
  sku: string;
  presentation_size: string;
  price: number;
  pan_eligibility_status: string;
  image_url: string;
  category_id: string | null;
};

export type ReadinessCheck = { key: keyof ReadinessInput; label: string; ok: boolean };

/** Public URL prefix every publishable image must start with (Supabase Storage bucket). */
export function productImagePrefix(supabaseUrl: string): string {
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/product-images/`;
}

export function readinessChecks(p: ReadinessInput, imagePrefix: string): ReadinessCheck[] {
  return [
    { key: "name", label: "Nombre", ok: p.name.trim().length >= 2 },
    { key: "category_id", label: "Categoría", ok: Boolean(p.category_id) },
    { key: "sku", label: "SKU", ok: p.sku.trim().length > 0 },
    { key: "presentation_size", label: "Presentación / tamaño", ok: p.presentation_size.trim().length > 0 },
    { key: "price", label: "Precio mayor de $0", ok: Number.isFinite(p.price) && p.price > 0 },
    {
      key: "pan_eligibility_status",
      label: "Clasificación PAN (elegible o no elegible)",
      ok: p.pan_eligibility_status === "eligible" || p.pan_eligibility_status === "ineligible",
    },
    { key: "image_url", label: "Imagen subida a Supabase Storage", ok: Boolean(imagePrefix) && p.image_url.startsWith(imagePrefix) },
  ];
}

/** Labels of unmet requirements; empty when the product can be published. */
export function missingForPublication(p: ReadinessInput, imagePrefix: string): string[] {
  return readinessChecks(p, imagePrefix).filter((c) => !c.ok).map((c) => c.label);
}
