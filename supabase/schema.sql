create extension if not exists pgcrypto;

create table if not exists public.logo_smash_scores (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 2 and 20),
  high_score integer not null check (high_score >= 0),
  updated_at timestamptz not null default now()
);

create unique index if not exists logo_smash_scores_nickname_lower_uidx
  on public.logo_smash_scores ((lower(nickname)));

alter table public.logo_smash_scores enable row level security;

drop policy if exists "logo_smash_scores_public_select" on public.logo_smash_scores;
drop policy if exists "logo_smash_scores_public_insert" on public.logo_smash_scores;
drop policy if exists "logo_smash_scores_public_update" on public.logo_smash_scores;

-- Public read access for leaderboard
create policy "logo_smash_scores_public_select"
  on public.logo_smash_scores
  for select
  using (true);

-- Public insert allowed with guardrails
create policy "logo_smash_scores_public_insert"
  on public.logo_smash_scores
  for insert
  with check (
    char_length(nickname) between 2 and 20
    and high_score >= 0
  );

-- Public update allowed with guardrails
create policy "logo_smash_scores_public_update"
  on public.logo_smash_scores
  for update
  using (true)
  with check (
    char_length(nickname) between 2 and 20
    and high_score >= 0
  );
