# LiryBoost — Modelo relacional de preproducción (NO EJECUTAR)

Estado: propuesta de esquema aislado; NO se han creado tablas ni aplicado migraciones en Supabase.
Destino conceptual: esquema privado no expuesto a la Data API; el equipo debe confirmar roles, propietario y permisos antes del despliegue.

## Entidades
### 1. Participantes
- `participant_id UUID PRIMARY KEY`; `owner_user_id UUID NOT NULL UNIQUE` vinculado a `auth.users(id)`.
- `public_alias TEXT` sujeto a validación, privacidad y posibles colisiones; `status` con valores `eligible`, `suspended`, `withdrawn`.
- `created_at`, `updated_at` asignados por servidor.
- No almacenar credenciales de sesión, correos o datos de perfil confidenciales.

### 2. Versiones de bases
- `rules_version TEXT PRIMARY KEY`, estado `published` y fecha UTC de publicación.
- La aceptación solo puede referir una versión realmente publicada.

### 3. Eventos de consentimiento (append-only)
- `event_id UUID PRIMARY KEY`, `owner_user_id UUID NOT NULL`, `operation_id UUID NOT NULL`, `event_sequence BIGINT NOT NULL`.
- `kind`: `accepted` o `withdrawn`; `rules_version` con referencia a bases.
- `recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()`; `payload_digest` para conflictos de reintentos.
- Índices `UNIQUE(owner_user_id, operation_id)` y `UNIQUE(owner_user_id,event_sequence)`.
- Revocación debe referenciar explícitamente aceptación previa y comprobar pertenencia.
- Impedir modificaciones/borrados por clientes ordinarios; definir política legal de retención antes de producción.

### 4. Autorización de aparición pública
- Consentimiento de listado independiente del consentimiento para participar.
- Eventos de otorgamiento y retiro, ordenados y auditables; nunca inferir autorización de un alias presente.
- La publicación requiere autorización vigente, participante elegible y bases actuales.

### 5. Atribuciones verificadas
- `attribution_id UUID PRIMARY KEY`; `referrer_user_id UUID NOT NULL`, `invitee_user_id UUID NOT NULL UNIQUE`.
- Restricción `CHECK(referrer_user_id <> invitee_user_id)`.
- `verification_status` `confirmed` o `rejected`; solo filas confirmadas suman invitaciones.
- Historial de comprobación interna con acceso restringido; no exponer UUID al público.

### 6. Estado protegido del programa
- Activación global desde configuración de servidor, cerrada por defecto.
- Requiere bases publicadas, auditoría legal/privacidad, control antifraude, RLS/GRANT y pruebas concurrentes.
- No permitir que parámetros del cliente modifiquen activación.

## Transacciones obligatorias
1. Registro: resolver `auth.getUser()`, comprobar elegibilidad y bases, crear participante + evento de aceptación con operación idempotente.
2. Revocación: bloquear estado del actor, registrar evento y retirar nuevas acreditaciones en el mismo orden transaccional.
3. Invitación: autenticar invitado/promotor, comprobar identidad/elegibilidad/consentimientos vigentes, ejecutar `INSERT` de atribución bajo unicidad, responder confirmado solo tras commit.
4. Top 10: usar lectura consistente, agrupación por dueño/participante único, únicamente alias públicos y conteos confirmados.

## Pruebas de integración pendientes
- Dos escrituras simultáneas con mismo `operation_id`: un evento.
- Reutilizar `operation_id` para distinta versión o acción: conflicto.
- Dos promotores por un invitado: solo una atribución definitiva.
- Revocación concurrente con atribución: ninguna acreditación fuera del orden serializado.
- Cambio de versión de bases: exclusión inmediata de consentimientos desactualizados.
- Usuario sin sesión/RLS insuficiente: ninguna escritura.
- Retiro de autorización pública: desaparece del Top 10.
- Falla de DB: sin fallback local, sin resultado confirmado.

## Bloqueos actuales
La interfaz sigue con inscripciones inactivas y `readLiryBoostTop10(null)`. Se requiere revisión legal de bases, privacidad, edad/menores, antifraude, roles y pruebas de concurrencia antes de aplicar migraciones o publicar resultados.

**Este documento es solo diseño; NO contiene SQL ejecutado.**
