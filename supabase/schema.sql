create extension if not exists "pgcrypto";

create table if not exists gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  city text not null,
  neighborhood text not null,
  chain_name text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  address text,
  google_place_id text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists gym_locations (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  label text not null default 'Main location',
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state_region text,
  postal_code text,
  country_code text not null default 'US',
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  created_at timestamptz not null default now()
);

create table if not exists user_profiles (
  id uuid primary key,
  username text unique not null,
  home_gym_id uuid references gyms(id),
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  score numeric(2, 1) not null check (score >= 1 and score <= 5),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists busyness_reports (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  score integer not null check (score in (25, 50, 75, 95)),
  source text not null default 'member',
  created_at timestamptz not null default now()
);

create index if not exists idx_busyness_reports_gym_created_at
  on busyness_reports (gym_id, created_at desc);

create table if not exists gym_submission_requests (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references user_profiles(id) on delete cascade,
  proposed_name text not null,
  proposed_chain_name text,
  proposed_address text not null,
  proposed_city text not null,
  proposed_state_region text,
  proposed_postal_code text,
  proposed_country_code text not null default 'US',
  proposed_latitude numeric(9, 6),
  proposed_longitude numeric(9, 6),
  notes text,
  duplicate_gym_id uuid references gyms(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'merged')),
  reviewed_by uuid references user_profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_gym_submission_requests_status_created_at
  on gym_submission_requests (status, created_at desc);

create table if not exists gym_edit_suggestions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  submitted_by uuid not null references user_profiles(id) on delete cascade,
  field_name text not null,
  proposed_value text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references user_profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists gym_photos (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  uploaded_by uuid references user_profiles(id) on delete set null,
  storage_path text not null,
  caption text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create or replace function nearby_duplicate_gyms(
  search_name text,
  search_lat numeric,
  search_lng numeric,
  radius numeric default 0.02
)
returns table (
  gym_id uuid,
  gym_name text,
  latitude numeric,
  longitude numeric
)
language sql
as $$
  select
    g.id,
    g.name,
    g.latitude,
    g.longitude
  from gyms g
  where lower(g.name) = lower(search_name)
    and g.latitude is not null
    and g.longitude is not null
    and abs(g.latitude - search_lat) <= radius
    and abs(g.longitude - search_lng) <= radius;
$$;

create or replace view live_busyness_scores as
select
  gym_id,
  round(
    sum(
      score * greatest(
        0.1,
        1 - extract(epoch from (now() - created_at)) / 5400
      )
    ) / nullif(
      sum(
        greatest(
          0.1,
          1 - extract(epoch from (now() - created_at)) / 5400
        )
      ),
      0
    )
  )::int as live_score,
  count(*)::int as report_count
from busyness_reports
where created_at >= now() - interval '90 minutes'
group by gym_id;
