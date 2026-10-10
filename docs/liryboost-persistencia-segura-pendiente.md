# LIRYBOOST — Persistencia segura de invitaciones (propuesta, NO aplicada)

Estado: **diseño pendiente de revisión y aprobación**. No crear tablas ni ejecutar SQL sobre el proyecto operativo FRAGMENTUN. No activar la competencia, puntos ni premios.

## Invariantes antes de habilitar el FrontDesk

1. El servidor identifica al usuario autenticado, nunca acepta un `referrer_id` suministrado libremente por el cliente como autoridad.
2. Un invitado solo puede aportar **una invitación verificada** al programa, independientemente del número de enlaces abiertos.
3. La identidad del invitado y su consentimiento se validan sin publicar correo, IP ni otros identificadores sensibles en el Top 10.
4. No se atribuye una invitación hasta completar el criterio objetivo de verificación aprobado.
5. Una restricción UNIQUE en base de datos resuelve carreras entre solicitudes simultáneas; una comprobación previa en JavaScript **no es suficiente**.
6. La transacción almacena invitación, atribución y evidencia de verificación en conjunto, con controles de acceso y políticas RLS.
7. El Top 10 se deriva únicamente de registros verificados e íntegros. No se expone hasta la apertura oficial y la aprobación de las bases.
8. Se requiere política antifraude, privacidad, retención y procedimiento de revisión antes del lanzamiento.

## Esquema SQL conceptual (NO ejecutar en producción)

```sql
-- EJEMPLO PARA UN FUTURO LABORATORIO AISLADO
create table liryboost_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null,
  invited_user_id uuid not null,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending','verified','rejected','revoked')),
  check (referrer_user_id <> invited_user_id),
  unique (invited_user_id)
);

create index liryboost_referrals_verified_rank_idx
  on liryboost_referrals(referrer_user_id, verified_at)
  where status='verified';
```

**Advertencia:** antes de utilizarlo deben adaptarse las claves foráneas a la identidad real, RLS, privilegios, consentimientos, reglas de disputa/revocación, criterios de verificación y mecanismo transaccional. No hay conexión desde el frontend a esta tabla porque **no existe**.

## Verificación futura sin costo adicional

- Probar localmente dos solicitudes simultáneas con el mismo invitado: una debe ganar, la otra recibir respuesta de duplicado.
- Probar autorreferencias, invalidación de consentimiento, reversión de verificación y acceso no autorizado.
- Verificar que el contador no suba con compartir enlaces sino con invitaciones **verificadas**.
