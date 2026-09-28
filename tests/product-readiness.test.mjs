import { test } from "node:test";
import assert from "node:assert/strict";
import { missingForPublication, productImagePrefix, readinessChecks } from "../lib/product-readiness.ts";

const PREFIX = productImagePrefix("https://abc.supabase.co/");
const READY = {
  name: "Advil 200 mg",
  sku: "ADV-200",
  presentation_size: "24 tabletas",
  price: 9.99,
  pan_eligibility_status: "ineligible",
  image_url: `${PREFIX}products/1.webp`,
  category_id: "7de7803f-7ea2-4e08-984f-a02e76c0eecf",
};

test("image prefix points at the product-images bucket", () => {
  assert.equal(PREFIX, "https://abc.supabase.co/storage/v1/object/public/product-images/");
});

test("a complete product has nothing missing", () => {
  assert.deepEqual(missingForPublication(READY, PREFIX), []);
  assert.equal(readinessChecks(READY, PREFIX).length, 7);
});

test("each requirement is enforced", () => {
  const cases = [
    [{ name: " " }, "Nombre"],
    [{ category_id: null }, "Categoría"],
    [{ sku: "  " }, "SKU"],
    [{ presentation_size: "" }, "Presentación / tamaño"],
    [{ price: 0 }, "Precio mayor de $0"],
    [{ price: Number.NaN }, "Precio mayor de $0"],
    [{ pan_eligibility_status: "unverified" }, "Clasificación PAN (elegible o no elegible)"],
    [{ image_url: "" }, "Imagen subida a Supabase Storage"],
    [{ image_url: "https://evil.example/x.jpg" }, "Imagen subida a Supabase Storage"],
    [{ image_url: "https://abc.supabase.co/storage/v1/object/public/other-bucket/x.jpg" }, "Imagen subida a Supabase Storage"],
  ];
  for (const [override, label] of cases) {
    assert.deepEqual(missingForPublication({ ...READY, ...override }, PREFIX), [label], JSON.stringify(override));
  }
});

test("without a configured image prefix nothing can be published", () => {
  assert.ok(missingForPublication(READY, "").includes("Imagen subida a Supabase Storage"));
});
