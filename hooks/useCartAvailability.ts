"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";

type Latest = { id: string; name: string; price: number; image_url: string | null; max_quantity: number };

export type CartAvailability = {
  /** "checking" until the first answer; "error" means it could not be verified (checkout still re-validates). */
  status: "idle" | "checking" | "ok" | "error";
  /** product id -> how many can be ordered now (0 = unavailable or sold out). null until known. */
  available: Record<string, number> | null;
  unavailableCount: number;
};

/**
 * Re-checks the saved cart against the live public catalog (price, name,
 * image, stock) once it is loaded and whenever the set of products changes.
 * Prices in the cart are updated in place; quantities are capped to stock.
 */
export function useCartAvailability(): CartAvailability {
  const { items, hydrated, applyAvailability } = useCart();
  const [available, setAvailable] = useState<Record<string, number> | null>(null);
  const [status, setStatus] = useState<CartAvailability["status"]>("idle");
  const idsKey = useMemo(() => items.map((i) => i.id).sort().join(","), [items]);

  useEffect(() => {
    if (!hydrated || !idsKey) return;
    let cancelled = false;
    setStatus("checking");
    fetch(`/api/catalog/cart?ids=${idsKey}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { items: Latest[] }) => {
        if (cancelled) return;
        applyAvailability(d.items);
        const map: Record<string, number> = {};
        for (const id of idsKey.split(",")) map[id] = d.items.find((i) => i.id === id)?.max_quantity ?? 0;
        setAvailable(map);
        setStatus("ok");
      })
      .catch(() => {
        if (cancelled) return;
        setAvailable(null);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, idsKey, applyAvailability]);

  const unavailableCount = available ? items.filter((i) => available[i.id] === 0).length : 0;
  return { status, available, unavailableCount };
}
