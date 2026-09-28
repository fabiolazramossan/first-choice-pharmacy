-- =============================================================================
-- PROPOSED MIGRATION — NOT APPLIED. DO NOT RUN WITHOUT OWNER APPROVAL.
-- Depends on: 20260928120000_create_order_function.sql
--
-- Because create_order() takes stock off inventory when an order is placed,
-- cancelling an order must put that stock back. This trigger does it inside
-- the same transaction as the status change.
--
-- Behavior change for the admin: a cancelled order can no longer be moved to
-- another status (reopening would require taking stock again, which may no
-- longer be available). Staff would create a new order instead.
--
-- Adds: function public.restock_cancelled_order(), trigger on public.orders.
-- Changes no existing data. Rollback: the matching .down.sql file.
--
-- PRE-APPLY CHECK: run `select count(*) from orders;` — it must be 0 (or all
-- existing orders must already be final), because orders created before
-- create_order() never took stock and must not be restocked on cancel.
-- =============================================================================

begin;

create or replace function public.restock_cancelled_order()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'ORDER_CANCELLED_FINAL' using errcode = 'P0001',
      hint = 'Cancelled orders cannot be reopened; create a new order.';
  end if;

  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update inventory i
       set quantity = i.quantity + oi.quantity,
           updated_at = now()
      from (
        select product_id, sum(quantity)::int as quantity
        from order_items
        where order_id = new.id and product_id is not null
        group by product_id
      ) oi
     where i.product_id = oi.product_id;
  end if;

  return new;
end;
$$;

revoke all on function public.restock_cancelled_order() from public, anon, authenticated;

create trigger orders_restock_on_cancel
  before update of status on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.restock_cancelled_order();

commit;
