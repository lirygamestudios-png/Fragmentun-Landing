-- LIRYGAMES Modelo A: 9 videojuegos, 3 mundos internos gratuitos por lanzamiento.
-- BORRADOR PARA REVISION. No ejecutar automaticamente sobre produccion.
-- Requiere game_titles(id UUID) existente y politicas administrativas revisadas.
create table if not exists public.game_internal_worlds (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.game_titles(id) on delete restrict,
  world_number integer not null check (world_number between 1 and 3),
  title text not null check (char_length(trim(title)) between 1 and 160),
  summary text,
  publication_status text not null default 'planned'
    check (publication_status in ('planned','beta','available','retired')),
  access_type text not null default 'free' check (access_type = 'free'),
  play_url text,
  artwork_url text,
  beta_enabled boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id,world_number),
  check (play_url is null or play_url ~ '^https://'),
  check (artwork_url is null or artwork_url ~ '^https://'),
  check (publication_status <> 'available' or play_url is not null),
  check (publication_status <> 'beta' or beta_enabled = true)
);

create index if not exists game_internal_worlds_game_idx
  on public.game_internal_worlds(game_id, world_number);

alter table public.game_internal_worlds enable row level security;

-- Sin politica anonima por ahora: la lectura publica se habilitara en una fase
-- posterior con control de publicacion del juego y acceso beta por usuario.

-- Administracion: restringir acceso a perfiles admin/editor autenticados.
create policy "admin_read_worlds" on public.game_internal_worlds
  for select to authenticated using (
    exists(select 1 from public.admin_profiles p
      where p.user_id = auth.uid() and p.role in ('admin','editor'))
  );
create policy "admin_insert_worlds" on public.game_internal_worlds
  for insert to authenticated with check (
    exists(select 1 from public.admin_profiles p
      where p.user_id = auth.uid() and p.role in ('admin','editor'))
  );
create policy "admin_update_worlds" on public.game_internal_worlds
  for update to authenticated
  using (exists(select 1 from public.admin_profiles p
    where p.user_id = auth.uid() and p.role in ('admin','editor')))
  with check (exists(select 1 from public.admin_profiles p
    where p.user_id = auth.uid() and p.role in ('admin','editor')));

-- No incluir politica DELETE y evitar ON DELETE CASCADE: preservar historial.
-- Desactivar mundos mediante el estado 'retired'.
-- IMPORTANTE: antes de ejecutar verificar tipos, politicas RLS y dependencia
-- de permisos para usuarios gamer autenticados en FrontDesk.
