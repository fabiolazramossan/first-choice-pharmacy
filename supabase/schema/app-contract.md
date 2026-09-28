# App ↔ database contract

What the application code reads and writes, and what was **verified** against
the live project on 2026-09-28 using only the public (publishable) key and
read-only requests. It is not a full schema; `introspection.json` will be.

## Verified with read-only probes

| Table | Columns confirmed to exist | Anonymous access |
|---|---|---|
| `products` | id, name, slug, brand, description, price, compare_at_price, image_url, category_id, sku, upc, is_active, is_featured, publication_status, requires_prescription, presentation_size, pan_eligibility_status, search_vector, created_at, updated_at | SELECT allowed; 0 rows visible (nothing published) |
| `categories` | id, name, slug, description, sort_order, is_active, image_url, created_at | SELECT allowed; 14 active rows |
| `inventory` | product_id (one-to-one with products), quantity, low_stock_threshold, updated_at | SELECT allowed; embeddable from `products` |
| `orders` | — | **Denied** (no grant to anon) ✔ |
| `order_items` | — | **Denied** ✔ |
| `order_status_history` | — | **Denied** ✔ |
| `user_roles` | — | **Denied** ✔ |

Also observed: RPC `public.update_product_inventory` exists (signature not
visible to anon); no `create_order` function exists yet; the schema listing
endpoint is correctly closed to the publishable key.

Not present: `products.published_at`, `products.stock_status`,
`inventory.reserved_quantity`, `categories.parent_id`.

## Used by the code (not verifiable anonymously)

- `orders`: id, order_number, status, fulfillment_method, customer_name,
  customer_email, customer_phone, delivery_address, subtotal, delivery_fee,
  tax, total, payment_status, paid_at, created_at, updated_at, updated_by,
  cancellation_reason — `app/api/admin/orders/route.ts`.
- `order_items`: id, product_name, sku, unit_price, quantity, line_total.
- `order_status_history`: order_id, from_status, to_status, actor_user_id,
  actor_role, reason.
- `user_roles`: user_id, role (`admin` | `manager` grant admin access).
- Storage bucket `product-images`: authenticated admin upload,
  public read at `/storage/v1/object/public/product-images/products/<uuid>.<ext>`.

## Rules the app assumes RLS enforces

- Anonymous users can read only published products and active categories.
- Only `admin`/`manager` users can write `products`, `inventory`, `categories`,
  `orders`, `order_status_history` and upload to `product-images`.
- Nobody but `service_role` can read other people's orders.

These must be confirmed from the `policies` section of `introspection.json`.
