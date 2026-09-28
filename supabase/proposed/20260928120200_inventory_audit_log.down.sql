-- Rollback for 20260928120200_inventory_audit_log.sql (PROPOSED — NOT APPLIED).
-- WARNING: dropping the table deletes the recorded history. Export it first
-- if any of it must be kept.
drop trigger if exists inventory_log_adjustment on public.inventory;
drop function if exists public.log_inventory_adjustment();
alter table public.inventory drop column if exists last_adjustment_reason;
drop table if exists public.inventory_adjustments;
