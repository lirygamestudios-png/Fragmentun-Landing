# LiryBoost — borrador SQL de seguridad, NO EJECUTAR

**Estado:** propuesta para revisión técnica y legal. Este documento no es una migración y no debe ejecutarse contra Supabase hasta aprobar la autenticación, el dominio, las bases del programa y el tratamiento de datos.

## Diseño de aislamiento

Preferir esquema `private_liryboost` excluido de los esquemas expuestos por la Data API. No conceder `USAGE`, `SELECT`, `INSERT`, `UPDATE` ni `DELETE` sobre este esquema o sus tablas a `anon` o `authenticated`. Mantener RLS activada como defensa adicional y no crear políticas públicas. Las operaciones de escritura deben pasar por funciones o rutas de servidor autorizadas que comprueben identidad real y consentimiento.

## DDL ilustrativo para revisión (NO EJECUTAR)

```sql
-- REVISIÓN SOLAMENTE. NO EJECUTAR EN PRODUCCIÓN.
create schema if not exists private_liryboost;

create table private_liryboost.participants (
  participant_id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id),
  public_alias text not null check (char_length(btrim(public_alias)) between 1 and 60),
  terms_version text not null,
  participation_consented_at timestamptz not null,
  listing_consented_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending','verified','suspended','withdrawn')),
  created_at timestamptz not null default now()
);

create table private_liryboost.referral_codes (
  referral_id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references private_liryboost.participants(participant_id),
  token_digest text not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table private_liryboost.verified_attributions (
  attribution_id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references private_liryboost.participants(participant_id),
  invitee_user_id uuid not null unique references auth.users(id),
  rule_version text not null,
  status text not null default 'verified'
    check (status in ('verified','revoked','under_review')),
  verified_at timestamptz not null default now()
);

create table private_liryboost.program_controls (
  control_id boolean primary key default true check (control_id),
  rules_version text,
  rules_published_at timestamptz,
  verification_enabled boolean not null default false,
  program_active boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table private_liryboost.participants enable row level security;
alter table private_liryboost.referral_codes enable row level security;
alter table private_liryboost.verified_attributions enable row level security;
alter table private_liryboost.program_controls enable row level security;

revoke all on schema private_liryboost from public, anon, authenticated;
revoke all on all tables in schema private_liryboost from public, anon, authenticated;
revoke all on all sequences in schema private_liryboost from public, anon, authenticated;
```

## Controles que el DDL por sí solo NO garantiza

- La prohibición de autorreferencias requiere comprobar en una operación transaccional que `inviter_id` no pertenece a `invitee_user_id`; están almacenados en tablas diferentes.
- `UNIQUE(invitee_user_id)` evita doble acreditación concurrente, pero deben definirse reglas explícitas de revocación y reapertura de un caso antes de habilitarlo.
- El consentimiento debe verificarse contra la versión de las bases y el estado vigente al insertar.
- Es indispensable un procedimiento servidor idempotente con permisos mínimos, registro auditable y pruebas con solicitudes concurrentes.
- `token_digest` no es un token público en texto claro. Definir generador criptográfico y algoritmo de digest/rotación antes de habilitar enlaces.
- Confirmar política de eliminación, menores, disputas, premios y estado de cuenta. No basta el SQL.
- Revisar con asesores de Supabase/DB, políticas RLS, privilegios y esquemas expuestos antes de aplicar cualquier migración.
- Las cuentas de servicio privilegiadas jamás deben aparecer en código cliente o variables `NEXT_PUBLIC_`.

## Puerta de lanzamiento
Hasta que existan bases publicadas, verificación real, permisos revisados, pruebas concurrentes y autorización explícita, mantener el endpoint `/api/liryboost/top10` inactivo y el formulario de registro deshabilitado.
