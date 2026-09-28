-- Rollback for 20260928120000_create_order_function.sql (PROPOSED — NOT APPLIED).
-- Removes only the function. Orders already created by it are kept.
drop function if exists public.create_order(jsonb, jsonb);
