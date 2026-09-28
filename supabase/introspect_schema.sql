-- First Choice Pharmacy — READ-ONLY schema introspection.
--
-- Run in Supabase Dashboard → SQL Editor. It only reads PostgreSQL system
-- catalogs: it returns NO table rows (no customer, order or product data),
-- NO secrets, and changes nothing. Output is a single JSON value; save it as
-- supabase/schema/introspection.json so it can be converted into a versioned
-- baseline migration.

with
tables as (
  select c.relname as table_name,
         c.relrowsecurity as rls_enabled,
         c.relforcerowsecurity as rls_forced,
         obj_description(c.oid, 'pg_class') as comment
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p')
),
columns as (
  select table_name, column_name, ordinal_position, data_type, udt_name,
         is_nullable, column_default, is_generated, generation_expression
  from information_schema.columns
  where table_schema = 'public'
),
constraints as (
  select conrelid::regclass::text as table_name, conname as name,
         contype as type, pg_get_constraintdef(oid) as definition
  from pg_constraint
  where connamespace = 'public'::regnamespace
),
indexes as (
  select tablename as table_name, indexname as name, indexdef as definition
  from pg_indexes
  where schemaname = 'public'
),
policies as (
  select schemaname as schema, tablename as table_name, policyname as name,
         permissive, roles, cmd, qual as using_expr, with_check as check_expr
  from pg_policies
  where schemaname in ('public', 'storage')
),
functions as (
  select p.proname as name,
         pg_get_function_identity_arguments(p.oid) as arguments,
         pg_get_function_result(p.oid) as returns,
         p.prosecdef as security_definer,
         p.proconfig as config,
         pg_get_functiondef(p.oid) as definition,
         array(select grantee::regrole::text
               from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner)))
               where privilege_type = 'EXECUTE' and grantee <> 0) as execute_roles,
         exists(select 1
                from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner)))
                where privilege_type = 'EXECUTE' and grantee = 0) as execute_public
  from pg_proc p
  where p.pronamespace = 'public'::regnamespace and p.prokind = 'f'
),
triggers as (
  select tgrelid::regclass::text as table_name, tgname as name,
         pg_get_triggerdef(oid) as definition, tgenabled as enabled
  from pg_trigger
  where not tgisinternal
    and tgrelid in (select oid from pg_class where relnamespace = 'public'::regnamespace)
),
table_grants as (
  select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) as privileges
  from information_schema.role_table_grants
  where table_schema = 'public' and grantee in ('anon', 'authenticated', 'service_role', 'PUBLIC')
  group by table_name, grantee
),
column_grants as (
  select table_name, column_name, grantee, privilege_type
  from information_schema.column_privileges
  where table_schema = 'public' and grantee in ('anon', 'authenticated')
),
enums as (
  select t.typname as name, array_agg(e.enumlabel order by e.enumsortorder) as labels
  from pg_type t
  join pg_enum e on e.enumtypid = t.oid
  where t.typnamespace = 'public'::regnamespace
  group by t.typname
),
sequences as (
  select sequence_name, data_type, start_value, increment
  from information_schema.sequences
  where sequence_schema = 'public'
),
views as (
  select table_name as name, view_definition as definition
  from information_schema.views
  where table_schema = 'public'
),
buckets as (
  -- Bucket configuration only; no stored objects are listed.
  select id, name, public, file_size_limit, allowed_mime_types
  from storage.buckets
),
extensions as (
  select extname as name, extversion as version from pg_extension
)
select jsonb_pretty(jsonb_build_object(
  'generated_at', now(),
  'postgres_version', current_setting('server_version'),
  'tables', (select jsonb_agg(to_jsonb(t) order by table_name) from tables t),
  'columns', (select jsonb_agg(to_jsonb(c) order by table_name, ordinal_position) from columns c),
  'constraints', (select jsonb_agg(to_jsonb(c) order by table_name, name) from constraints c),
  'indexes', (select jsonb_agg(to_jsonb(i) order by table_name, name) from indexes i),
  'policies', (select jsonb_agg(to_jsonb(p) order by schema, table_name, name) from policies p),
  'functions', (select jsonb_agg(to_jsonb(f) order by name) from functions f),
  'triggers', (select jsonb_agg(to_jsonb(t) order by table_name, name) from triggers t),
  'table_grants', (select jsonb_agg(to_jsonb(g) order by table_name, grantee) from table_grants g),
  'column_grants', (select jsonb_agg(to_jsonb(g) order by table_name, column_name) from column_grants g),
  'enums', (select jsonb_agg(to_jsonb(e) order by name) from enums e),
  'sequences', (select jsonb_agg(to_jsonb(s) order by sequence_name) from sequences s),
  'views', (select jsonb_agg(to_jsonb(v) order by name) from views v),
  'storage_buckets', (select jsonb_agg(to_jsonb(b) order by id) from buckets b),
  'extensions', (select jsonb_agg(to_jsonb(x) order by name) from extensions x)
)) as schema_introspection;
