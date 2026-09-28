# QA: create 3 test products through the admin

Goal: exercise the real admin → storefront flow with real data, without
inserting anything directly into the database. Online ordering stays off
(`ORDERS_ENABLED` unset), so nothing can be purchased.

Use obviously fake names starting with `[PRUEBA]`. The storefront hides
`[PRUEBA]` products **only on the Vercel production deployment**; they are
visible locally and on previews, which is what we want for QA.

## Before you start
- An admin/manager account in Supabase (`user_roles`).
- 3 small product photos (JPG/PNG/WebP, ≤ 1 MB each).
- `npm run dev` running, then open http://localhost:3000/admin/login.

## The 3 products

| # | Name | Category | Price | Stock | Featured | Tests |
|---|---|---|---|---|---|---|
| 1 | `[PRUEBA] Producto A` | Medicamentos OTC | 5.99 | 12 | yes | normal published product, homepage "Destacados" |
| 2 | `[PRUEBA] Producto B` | same category | 3.49 (precio anterior 4.99) | 2 | no | "Máximo por orden: 2", sale price, related products |
| 3 | `[PRUEBA] Producto C` | another category | 9.99 | 0 | no | sold-out state, "Solo disponibles" filter |

For each: **+ Añadir** (name, category, price, stock) → it is created as a
**Borrador** → **Editar** → fill SKU, presentación, PAN, image (and
description, UPC if you like) → watch the checklist turn all ✓ → tick
**Publicar en la tienda** (and **Destacar** for #1) → **Guardar cambios**.

## Checks
1. Before publishing, try to save with **Publicar** ticked and the image
   missing: it must refuse and list what is missing, inside the dialog.
2. `/` shows #1 under “Productos destacados”.
3. `/productos` lists all three; search `producto a` and `PRODUCTO` (case)
   finds them; sort by price; “Solo disponibles” hides #3.
4. `/producto/…` for #2 offers quantities 1–2 only and shows the old price
   crossed out; “Más en …” lists #1.
5. #3 shows **Agotado** and cannot be added to the cart.
6. Add #1 and #2 to the cart → prices match → checkout shows
   “Las órdenes en línea aún no están disponibles” and submit stays disabled.
7. In admin, set #1 stock to 0 → reload the cart: it is flagged unavailable.

## Cleanup
Uncheck **Publicar en la tienda** on all three (they disappear from the
store). Products cannot be deleted from the admin by design; leave them as
drafts or remove them later together with the team.
