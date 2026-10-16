-- First Choice Pharmacy: atomic order intake. Review and apply in Supabase SQL editor.
-- Requires the server-side SUPABASE_SERVICE_ROLE_KEY configured in Vercel.
-- No customer-facing RPC permissions are granted.
create or replace function public.fc_create_order(
  p_customer_name text, p_customer_email text, p_customer_phone text,
  p_fulfillment_method text, p_delivery_address jsonb,
  p_items jsonb, p_idempotency_key text
) returns table (created_id uuid, created_number bigint, created_subtotal numeric)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_order uuid;
  v_number bigint;
  v_subtotal numeric := 0;
  v_line jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_count integer := 0;
  v_id uuid;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'not authorized';
  end if;
  if length(trim(p_customer_name)) < 2 or length(p_customer_name) > 100
    or length(p_customer_phone) < 7 or length(p_customer_phone) > 24
    or length(p_customer_email) > 160
    or p_fulfillment_method not in ('pickup','delivery')
    or jsonb_typeof(p_items) is distinct from 'array'
    or jsonb_array_length(p_items) not between 1 and 25
    or length(p_idempotency_key) not between 16 and 120 then
    raise exception 'invalid order';
  end if;
  if p_fulfillment_method='delivery' and
     (p_delivery_address is null or length(coalesce(p_delivery_address->>'addressLine','')) < 5) then
    raise exception 'invalid delivery address';
  end if;
  -- A unique idempotency key avoids duplicate orders on retries.
  select o.id,o.order_number,o.subtotal into v_order,v_number,v_subtotal
    from public.orders o where o.idempotency_key=p_idempotency_key;
  if found then
    return query select v_order,v_number,v_subtotal;
    return;
  end if;
  for v_line in select value from jsonb_array_elements(p_items)
  loop
    v_count := v_count + 1;
    begin
      v_id := (v_line->>'id')::uuid;
      v_quantity := (v_line->>'quantity')::integer;
    exception when others then raise exception 'invalid item';
    end;
    if v_quantity not between 1 and 10 then raise exception 'invalid quantity'; end if;
    select * into v_product from public.products
      where id=v_id and is_active=true and requires_prescription=false
      and price>0 and name not like '[PRUEBA]%' for share;
    if not found then raise exception 'product unavailable'; end if;
    if exists(select 1 from jsonb_array_elements(p_items) other
              where other->>'id'=v_line->>'id' and other <> v_line) then
      raise exception 'duplicate product';
    end if;
    v_subtotal := v_subtotal + round(v_product.price * v_quantity,2);
  end loop;
  insert into public.orders
    (status,fulfillment_method,customer_name,customer_email,customer_phone,
     delivery_address,subtotal,delivery_fee,tax,total,payment_status,idempotency_key)
  values ('pending',p_fulfillment_method,trim(p_customer_name),coalesce(p_customer_email,''),
    trim(p_customer_phone),case when p_fulfillment_method='delivery' then p_delivery_address else null end,
    v_subtotal,0,0,v_subtotal,'unpaid',p_idempotency_key)
  returning id,order_number into v_order,v_number;
  for v_line in select value from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products where id=(v_line->>'id')::uuid;
    v_quantity := (v_line->>'quantity')::integer;
    insert into public.order_items
      (order_id,product_id,product_name,sku,unit_price,quantity,line_total)
    values(v_order,v_product.id,v_product.name,v_product.sku,v_product.price,v_quantity,
           round(v_product.price*v_quantity,2));
  end loop;
  return query select v_order,v_number,v_subtotal;
end $$;
revoke all on function public.fc_create_order(text,text,text,text,jsonb,jsonb,text) from public, anon, authenticated;
grant execute on function public.fc_create_order(text,text,text,text,jsonb,jsonb,text) to service_role;
