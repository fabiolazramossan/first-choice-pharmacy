-- =============================================================================
-- PROPOSED MIGRATION — NOT APPLIED. DO NOT RUN WITHOUT OWNER APPROVAL.
--
-- Stores, per product, whether IVU applies. NULL means "not yet classified",
-- which keeps IVU "a confirmar" (see lib/pricing.ts). No rate is stored here:
-- rates stay in configuration (IVU_RATE) until the accountant confirms them.
--
-- Adds one nullable column; existing rows get NULL (unknown). Nothing else
-- changes. Rollback: 20260928120300_product_ivu_taxable.down.sql
-- =============================================================================

begin;

alter table public.products
  add column if not exists ivu_taxable boolean;

comment on column public.products.ivu_taxable is
  'IVU applies to this product: true/false once classified by the accountant; NULL = unknown (IVU shown as "a confirmar").';

commit;
