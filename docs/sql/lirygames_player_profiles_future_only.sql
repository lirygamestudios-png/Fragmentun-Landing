-- LIRYGAMES STUDIOS · ESQUEMA FUTURO, NO EJECUTAR EN FRAGMENTUN.
-- Aplicar SOLO en proyecto Supabase independiente de LIRYGAMES, previa revisión y autorización.
-- No crea cuentas, no habilita pagos, no publica imágenes ni altera proyecto actual.
begin;
create table if not exists public.liry_player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (
    char_length(display_name) between 2 and 40
    and display_name = btrim(display_name)
    and display_name !~ '[<>[:cntrl:]]'
  ),
  preferred_locale text not null default 'es' check (preferred_locale in ('es','en')),
  notifications_enabled boolean not null default false,
  reduce_motion boolean not null default false,
  private_profile boolean not null default true,
  avatar_object_key text,
  updated_at timestamptz not null default now(),
  constraint liry_avatar_key_owned check (
    avatar_object_key is null or
    (avatar_object_key ~ '^[a-zA-Z0-9_-]{8,128}/[a-zA-Z0-9_-]{8,80}$'
     and split_part(avatar_object_key,'/',1) = user_id::text)
  )
);
alter table public.liry_player_profiles enable row level security;
revoke all on public.liry_player_profiles from anon;
grant select,insert,update on public.liry_player_profiles to authenticated;
create policy liry_profile_own_read on public.liry_player_profiles
 for select to authenticated using ((select auth.uid()) = user_id);
create policy liry_profile_own_create on public.liry_player_profiles
 for insert to authenticated with check ((select auth.uid()) = user_id);
create policy liry_profile_own_edit on public.liry_player_profiles
 for update to authenticated using ((select auth.uid()) = user_id)
 with check ((select auth.uid()) = user_id);
commit;
-- REVISIÓN OBLIGATORIA ANTES DE APLICAR:
-- 1. Enlazar este esquema solo a identidad Liry ID. Nunca compartir auth.users con FRAGMENTUN.
-- 2. Realizar pruebas cruzadas con dos usuarios distintos y sin autenticación.
-- 3. Revisar permisos y políticas con el asesor de seguridad.
-- 4. Definir flujo de almacenamiento PRIVADO de avatares con validación y RLS independientes.
-- 5. No activar UI de guardado hasta verificar el despliegue, el aislamiento y las cuotas.
