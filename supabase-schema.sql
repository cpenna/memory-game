create table if not exists public.players (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.scores (
    player_id uuid primary key references public.players(id) on delete cascade,
    best_score integer not null default 0 check (best_score >= 0),
    updated_at timestamptz not null default now()
);

create or replace function public.update_timestamp()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists players_updated_at on public.players;
create trigger players_updated_at
before update on public.players
for each row execute function public.update_timestamp();

drop trigger if exists scores_updated_at on public.scores;
create trigger scores_updated_at
before update on public.scores
for each row execute function public.update_timestamp();
