-- Rollback for 20260928120100_restock_on_cancel.sql (PROPOSED — NOT APPLIED).
drop trigger if exists orders_restock_on_cancel on public.orders;
drop function if exists public.restock_cancelled_order();
