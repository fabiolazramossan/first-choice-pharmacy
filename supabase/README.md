# Supabase database

Project ref: `vhwpotmsdmaqizkvgowl`. The live schema, RLS policies and triggers
were created in the Supabase dashboard and are **not yet versioned**. This
folder is where they become versioned, without secrets or data.

| Path | Status |
|---|---|
| `introspect_schema.sql` | Read-only catalog query. Safe to run any time. |
| `schema/app-contract.md` | What the app depends on, verified against the live API. |
| `schema/introspection.json` | **Missing.** Output of `introspect_schema.sql` (see step 1). |
| `migrations/` | **Missing.** Baseline migration, generated from the introspection. |
| `proposed/` | Reviewed-but-**NOT-applied** changes. The CLI never reads this folder. |

## 1. Capture the live schema (read-only)

Choose one:

**A. SQL Editor (no installs).** Open Supabase Dashboard → SQL Editor, paste
`introspect_schema.sql`, run it, and save the single JSON result as
`supabase/schema/introspection.json`. The query reads only PostgreSQL system
catalogs: no table rows, no customer data, no keys.

**B. Supabase CLI** (requires Docker Desktop for `db dump`):

```bash
npx supabase login
npx supabase link --project-ref vhwpotmsdmaqizkvgowl
npx supabase db dump --schema public,storage -f supabase/migrations/20260928000000_baseline.sql
```

`db dump` without `--data-only` exports structure only. Either way, review
the file before committing: function bodies are included, so confirm none of
them contain hard-coded tokens or URLs with credentials.

## 2. Baseline migration

From the introspection output a baseline migration
(`migrations/<timestamp>_baseline.sql`) is written that recreates the current
tables, constraints, indexes, RLS policies, functions, triggers, grants and the
`product-images` bucket policies. It is **marked as already applied** on the
live project (`supabase migration repair --status applied <timestamp>`) and is
**never executed** against production.

## 3. Proposed changes (need owner approval)

### `proposed/20260928120000_create_order_function.sql`

Adds `public.create_order(p_customer jsonb, p_items jsonb)`. Nothing is
dropped or altered and no existing rows change. In one transaction it:

1. validates customer, fulfillment method and cart (1–25 lines, 1–10 each);
2. locks the inventory rows involved (`FOR UPDATE`, ordered by id);
3. requires every product to be active, `published` and OTC, with enough stock;
4. prices the cart from `products.price` (never from the browser);
5. inserts `orders`, `order_items`, the first `order_status_history` row, and
   decrements `inventory`.

Execution is granted **only to `service_role`**. The public publishable key
cannot call it, so nobody can bypass the website's validation and rate limits
to create fake orders or drain stock. The website calls it from
`lib/orders.ts` using `SUPABASE_SECRET_KEY` (server-only).

Assumptions to verify against `introspection.json` before applying (marked
`ASSUMPTION` in the SQL): column names on `orders` (notably `customer_notes`),
the default for `order_number`, allowed `payment_status` values, and
nullability of `order_status_history.from_status` / `actor_user_id`.

Rollback: `proposed/20260928120000_create_order_function.down.sql`.

### `proposed/20260928120100_restock_on_cancel.sql`

Trigger on `orders`: cancelling an order returns its quantities to
`inventory`; a cancelled order can no longer be reopened (admin behavior
change). Pre-apply check: `select count(*) from orders;` must be 0, since
older orders never took stock. Rollback: matching `.down.sql`.

## 4. Applying (only after approval)

1. Verify the assumptions above; adjust the SQL if needed.
2. Apply on a **Supabase branch or a copy project first** and run a test order.
3. Apply to production in the SQL Editor (or move the file into `migrations/`
   and run `npx supabase db push`).
4. Add `SUPABASE_SECRET_KEY` to Vercel (Production, server-only).
5. Only then consider `ORDERS_ENABLED=true`.

Until then `/api/orders` fails closed: it returns 503 while `ORDERS_ENABLED`
is not `true`, and also when `SUPABASE_SECRET_KEY` is missing.
