-- =============================================================================
-- PROPOSED MIGRATION — NOT APPLIED. DO NOT RUN WITHOUT OWNER APPROVAL.
--
-- Adds an append-only history of every inventory quantity change.
--
-- Adds (nothing dropped, no existing rows modified):
--   * table  public.inventory_adjustments
--   * column public.inventory.last_adjustment_reason (nullable text) — lets
--     the admin UI attach a reason ("conteo físico", "merma", …) to a change
--   * trigger function public.log_inventory_adjustment() + BEFORE INSERT/UPDATE
--     trigger on public.inventory. It logs quantity changes and then clears
--     last_adjustment_reason, so a reason applies to exactly one change and
--     is never carried over to a later one.
--
-- Every change is logged by the database itself, whichever path made it
-- (admin panel, create_order(), restock-on-cancel, SQL editor). The actor is
-- auth.uid() from the admin's own session; NULL means a server/system change.
--
-- Rows can be read by admin/manager users only and cannot be edited or
-- deleted through the API (no insert/update/delete policies).
--
-- ASSUMPTION: role membership lives in public.user_roles(user_id, role),
-- as the app's login code reads it. Verify against introspection.json and
-- reuse an existing helper (e.g. has_role()) if one exists.
--
-- Rollback: 20260928120200_inventory_audit_log.down.sql
-- =============================================================================

begin;

create table if not exists public.inventory_adjustments (
  id                bigint generated always as identity primary key,
  product_id        uuid        not null references public.products(id),
  previous_quantity integer,
  new_quantity      integer     not null,
  delta             integer     generated always as (new_quantity - coalesce(previous_quantity, 0)) stored,
  reason            text        check (char_length(reason) <= 200),
  actor_user_id     uuid        default auth.uid(),
  created_at        timestamptz not null default now()
);

create index if not exists inventory_adjustments_product_created_idx
  on public.inventory_adjustments (product_id, created_at desc);

alter table public.inventory_adjustments enable row level security;

create policy "Admins read inventory history"
  on public.inventory_adjustments
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid() and r.role in ('admin', 'manager')
    )
  );

revoke insert, update, delete on public.inventory_adjustments from anon, authenticated;
grant select on public.inventory_adjustments to authenticated;

alter table public.inventory
  add column if not exists last_adjustment_reason text
  check (char_length(last_adjustment_reason) <= 200);

create or replace function public.log_inventory_adjustment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' or new.quantity is distinct from old.quantity then
    -- Runs in the same transaction: if the inventory write fails, so does the log.
    insert into inventory_adjustments (product_id, previous_quantity, new_quantity, reason, actor_user_id)
    values (
      new.product_id,
      case when tg_op = 'INSERT' then null else old.quantity end,
      new.quantity,
      new.last_adjustment_reason,
      auth.uid()
    );
  end if;
  new.last_adjustment_reason := null;
  return new;
end;
$$;

revoke all on function public.log_inventory_adjustment() from public, anon, authenticated;

create trigger inventory_log_adjustment
  before insert or update on public.inventory
  for each row
  execute function public.log_inventory_adjustment();

commit;
