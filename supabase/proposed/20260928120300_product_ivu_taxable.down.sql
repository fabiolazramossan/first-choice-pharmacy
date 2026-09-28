-- Rollback for 20260928120300_product_ivu_taxable.sql (PROPOSED — NOT APPLIED).
-- Drops the classification data entered since the migration.
alter table public.products drop column if exists ivu_taxable;
