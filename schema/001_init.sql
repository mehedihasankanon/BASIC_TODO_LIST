-- ===========================================================================
-- PERN Todo List - database schema (Supabase / PostgreSQL)
-- File: schema/001_init.sql
--
-- Run this against a fresh Supabase project:
--   1. Supabase Dashboard -> SQL Editor -> New query
--   2. Paste this whole file and click "Run"
--
-- It is safe to re-run: tables, indexes and triggers are created only when
-- they do not already exist.
--
-- The Express API uses the Supabase service role key, so Row Level Security
-- is enabled below without any policies. That blocks anon/authenticated API
-- access while the backend (service role) keeps full access.
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at in sync on every UPDATE
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- users
-- Passwords are stored as bcrypt hashes (never plain text).
-- ---------------------------------------------------------------------------
create table if not exists public.users (
    user_id       serial primary key,
    user_name     varchar(255) not null,
    user_email    varchar(320) not null unique,
    user_password varchar(255) not null,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

comment on table public.users is 'Application users authenticated by the Express API (JWT).';
comment on column public.users.user_password is 'bcrypt password hash.';

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
    before update on public.users
    for each row
    execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- todo
-- One row per task, owned by exactly one user.
-- ---------------------------------------------------------------------------
create table if not exists public.todo (
    todo_id      serial primary key,
    description  varchar(255) not null,
    user_id      integer not null references public.users (user_id) on delete cascade,
    is_completed boolean not null default false,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

comment on table public.todo is 'Todo items owned by a user.';

drop trigger if exists todo_set_updated_at on public.todo;
create trigger todo_set_updated_at
    before update on public.todo
    for each row
    execute function public.set_updated_at();

-- The list query is: WHERE user_id = $1 ORDER BY is_completed ASC, created_at DESC
create index if not exists todo_user_id_completed_created_idx
    on public.todo (user_id, is_completed, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- No policies are defined: only the service_role key (used by the server)
-- can read or write these tables.
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.todo enable row level security;

commit;

-- ===========================================================================
-- Optional: reset the schema during development.
-- Uncomment and run ONLY if you want to delete all data.
-- ===========================================================================
-- drop table if exists public.todo cascade;
-- drop table if exists public.users cascade;
-- drop function if exists public.set_updated_at() cascade;
