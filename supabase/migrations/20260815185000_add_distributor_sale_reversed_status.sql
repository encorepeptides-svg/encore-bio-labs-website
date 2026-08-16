-- PostgreSQL requires a newly added enum value to be committed before it is
-- referenced by later functions in the accounting migration.
alter type public.distributor_sale_status add value if not exists 'reversed';
