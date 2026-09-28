-- =============================================================================
-- PROPOSED MIGRATION — NOT APPLIED. DO NOT RUN WITHOUT OWNER APPROVAL.
--
-- Lives in supabase/proposed/ (not supabase/migrations/) so no CLI command
-- applies it by accident. Before applying, verify every "ASSUMPTION" comment
-- against supabase/schema/introspection.json.
--
-- What it adds (nothing is dropped or altered; no existing data is touched):
--   public.create_order(p_customer jsonb, p_items jsonb) returns jsonb
--
-- What the function does, in ONE transaction:
--   1. Validates customer fields, fulfillment method and cart shape.
--   2. Locks the inventory rows of the requested products (FOR UPDATE, in a
--      stable order to avoid deadlocks) so two checkouts cannot sell the same
--      last unit.
--   3. Re-checks every product is active, published and OTC, and that stock
--      covers the requested quantity.
--   4. Reads prices from the database (the browser never sets prices).
--   5. Inserts orders + order_items, decrements inventory, and writes the
--      first order_status_history row.
--   Any failure rolls back everything: no partial orders, no lost stock.
--
-- Who can call it: ONLY service_role (the server, using a secret key kept in
-- a server-only environment variable). anon/authenticated cannot execute it,
-- so the public publishable key cannot be used to create orders or drain
-- stock by calling the RPC directly and bypassing the site's rate limits.
--
-- Rollback: supabase/proposed/20260928120000_create_order_function.down.sql
-- =============================================================================

begin;

create or replace function public.create_order(p_customer jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name     text  := btrim(coalesce(p_customer->>'name', ''));
  v_phone    text  := btrim(coalesce(p_customer->>'phone', ''));
  v_email    text  := nullif(lower(btrim(coalesce(p_customer->>'email', ''))), '');
  v_method   text  := p_customer->>'fulfillment_method';
  v_address  jsonb := p_customer->'delivery_address';
  v_notes    text  := nullif(btrim(coalesce(p_customer->>'notes', '')), '');
  v_ids      uuid[];
  v_qtys     int[];
  v_found    int;
  v_short    text;
  v_subtotal numeric(12, 2);
  v_order_id uuid;
  v_order_number bigint;
begin
  -- 1. Validate input -------------------------------------------------------
  if char_length(v_name) not between 2 and 100 then
    raise exception 'INVALID_NAME' using errcode = '22023';
  end if;
  if v_phone !~ '^[0-9 ()+.-]{7,24}$' then
    raise exception 'INVALID_PHONE' using errcode = '22023';
  end if;
  if v_email is not null and (char_length(v_email) > 160 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') then
    raise exception 'INVALID_EMAIL' using errcode = '22023';
  end if;
  if v_method is null or v_method not in ('pickup', 'delivery') then
    raise exception 'INVALID_FULFILLMENT' using errcode = '22023';
  end if;
  if v_method = 'delivery' then
    if jsonb_typeof(v_address) is distinct from 'object'
       or char_length(coalesce(v_address->>'line1', '')) not between 5 and 120
       or char_length(coalesce(v_address->>'city', '')) not between 2 and 80
       or coalesce(v_address->>'postal_code', '') !~ '^[0-9]{5}(-[0-9]{4})?$' then
      raise exception 'INVALID_ADDRESS' using errcode = '22023';
    end if;
    v_address := jsonb_build_object(
      'line1', v_address->>'line1',
      'city', v_address->>'city',
      'state', 'PR',
      'postal_code', v_address->>'postal_code'
    );
  else
    v_address := null;
  end if;
  if char_length(coalesce(v_notes, '')) > 300 then
    raise exception 'INVALID_NOTES' using errcode = '22023';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) not between 1 and 25 then
    raise exception 'INVALID_CART' using errcode = '22023';
  end if;

  -- Merge duplicate lines; malformed ids/quantities raise a cast error.
  select array_agg(product_id order by product_id), array_agg(quantity order by product_id)
    into v_ids, v_qtys
  from (
    select (e->>'product_id')::uuid as product_id, sum((e->>'quantity')::int)::int as quantity
    from jsonb_array_elements(p_items) as e
    group by 1
  ) merged;

  if exists (select 1 from unnest(v_qtys) q where q is null or q < 1 or q > 10) then
    raise exception 'INVALID_QUANTITY' using errcode = '22023';
  end if;

  -- 2. Lock inventory rows in a stable order ----------------------------------
  perform 1 from inventory where product_id = any(v_ids) order by product_id for update;

  -- 3. Availability and stock -------------------------------------------------
  select count(*) into v_found
  from products p
  join inventory i on i.product_id = p.id
  where p.id = any(v_ids)
    and p.is_active
    and p.publication_status = 'published'
    and not p.requires_prescription;

  if v_found <> cardinality(v_ids) then
    raise exception 'PRODUCT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  select p.name into v_short
  from unnest(v_ids, v_qtys) as r(id, qty)
  join products p on p.id = r.id
  join inventory i on i.product_id = r.id
  where i.quantity < r.qty
  order by p.name
  limit 1;

  if v_short is not null then
    raise exception 'INSUFFICIENT_STOCK' using errcode = 'P0001', detail = v_short;
  end if;

  -- 4. Prices come from the database -----------------------------------------
  select sum(round(p.price, 2) * r.qty) into v_subtotal
  from unnest(v_ids, v_qtys) as r(id, qty)
  join products p on p.id = r.id;

  -- 5. Write the order ---------------------------------------------------------
  -- ASSUMPTION: orders has these columns; id and order_number have defaults
  -- (uuid + sequence); a notes column is named "customer_notes"; the initial
  -- payment_status value is 'pending' (admin UI treats anything but 'paid' as
  -- pending). Delivery fee and IVU stay 0 until the pharmacy confirms the
  -- total, matching the current pay-at-pickup/delivery process.
  insert into orders (
    status, fulfillment_method, customer_name, customer_email, customer_phone,
    delivery_address, customer_notes, subtotal, delivery_fee, tax, total, payment_status
  ) values (
    'pending', v_method, v_name, v_email, v_phone,
    v_address, v_notes, v_subtotal, 0, 0, v_subtotal, 'pending'
  )
  returning id, order_number into v_order_id, v_order_number;

  -- ASSUMPTION: order_items has order_id and product_id foreign keys.
  insert into order_items (order_id, product_id, product_name, sku, unit_price, quantity, line_total)
  select v_order_id, p.id, p.name, p.sku, round(p.price, 2), r.qty, round(p.price, 2) * r.qty
  from unnest(v_ids, v_qtys) as r(id, qty)
  join products p on p.id = r.id;

  update inventory i
     set quantity = i.quantity - r.qty,
         updated_at = now()
    from unnest(v_ids, v_qtys) as r(id, qty)
   where i.product_id = r.id;

  -- ASSUMPTION: from_status and actor_user_id are nullable.
  insert into order_status_history (order_id, from_status, to_status, actor_user_id, actor_role, reason)
  values (v_order_id, null, 'pending', null, 'customer', 'Orden creada en la web');

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'items', (
      select jsonb_agg(jsonb_build_object(
        'product_name', oi.product_name,
        'sku', oi.sku,
        'unit_price', oi.unit_price,
        'quantity', oi.quantity,
        'line_total', oi.line_total
      ) order by oi.product_name)
      from order_items oi
      where oi.order_id = v_order_id
    )
  );
end;
$$;

comment on function public.create_order(jsonb, jsonb) is
  'Atomically validates a web checkout, reserves stock and records the order. Server-only (service_role).';

revoke all on function public.create_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_order(jsonb, jsonb) to service_role;

commit;
