-- Restaurants table
create table if not exists public.restaurants (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    logo_url text,
    theme_config jsonb,
    subscription_id bigint not null references public.subscriptions(id),
    owner_name text not null,
    owner_email text not null,
    owner_phone text,
    subscription_started_at timestamptz not null default now(),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Restaurant users mapping
create table if not exists public.restaurant_users (
    id uuid primary key default gen_random_uuid(),
    restaurant_id uuid not null references public.restaurants(id) on delete cascade,
    auth_user_id uuid not null,
    role text not null check (role in ('OWNER', 'MANAGER', 'STAFF')),
    is_active boolean not null default true,
    display_name text,
    phone text,
    created_at timestamptz not null default now(),
    constraint uq_restaurant_user_auth unique (restaurant_id, auth_user_id),
    constraint uq_restaurant_user_auth_only unique (auth_user_id)
);

-- Enable RLS
alter table public.restaurants enable row level security;
alter table public.restaurant_users enable row level security;

-- Policies
create policy "restaurant members can view restaurant"
on public.restaurants
for select
using (
    exists (
        select 1
        from public.restaurant_users ru
        where ru.restaurant_id = restaurants.id
          and ru.auth_user_id = auth.uid()
          and ru.is_active = true
    )
);

create policy "restaurant owners can update restaurant"
on public.restaurants
for update
using (
    exists (
        select 1
        from public.restaurant_users ru
        where ru.restaurant_id = restaurants.id
          and ru.auth_user_id = auth.uid()
          and ru.role = 'OWNER'
          and ru.is_active = true
    )
);

create policy "users can view their membership"
on public.restaurant_users
for select
using (auth_user_id = auth.uid());
