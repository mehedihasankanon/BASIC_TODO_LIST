# Database schema

SQL schema for the Supabase (PostgreSQL) backend.

| File | Purpose |
| --- | --- |
| [`001_init.sql`](./001_init.sql) | Creates the `users` and `todo` tables, indexes, `updated_at` triggers and RLS. |

## How to run it

### Supabase (recommended)

1. Open your project at <https://supabase.com/dashboard>.
2. Go to **SQL Editor → New query**.
3. Paste the contents of `001_init.sql` and click **Run**.
4. Copy your **Project URL** and **service role key** from **Project Settings → API** into `.env`.

### Local PostgreSQL

```bash
psql "$DATABASE_URL" -f schema/001_init.sql
```

## Tables

### `users`

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | `serial` | Primary key, referenced by `todo.user_id` |
| `user_name` | `varchar(255)` | Display name |
| `user_email` | `varchar(320)` | Unique login email |
| `user_password` | `varchar(255)` | bcrypt hash created by the API |
| `created_at` | `timestamptz` | Defaults to `now()` |
| `updated_at` | `timestamptz` | Defaults to `now()`, maintained by trigger |

### `todo`

| Column | Type | Notes |
| --- | --- | --- |
| `todo_id` | `serial` | Primary key |
| `description` | `varchar(255)` | Todo text |
| `user_id` | `integer` | FK → `users.user_id`, `ON DELETE CASCADE` |
| `is_completed` | `boolean` | Defaults to `false` |
| `created_at` | `timestamptz` | Defaults to `now()` |
| `updated_at` | `timestamptz` | Defaults to `now()`, maintained by trigger |

## Row Level Security

RLS is **enabled with no policies**. The API authenticates with its own JWT and talks to Supabase
using the **service role key**, which bypasses RLS. The anon key therefore cannot read these tables
directly — that is intentional.

If you ever switch `.env` to `SUPABASE_ANON_KEY`, you must either:

- add RLS policies for the `anon` role, or
- disable RLS with `alter table public.users disable row level security;` (not recommended).

## Migrating existing local data

This schema is for a **fresh** Supabase database. To bring over rows from a local
`newtest` database, export the data (for example with `pg_dump --data-only`) and import it
**after** the schema exists. Insert `users` before `todo` so the foreign key is satisfied.
