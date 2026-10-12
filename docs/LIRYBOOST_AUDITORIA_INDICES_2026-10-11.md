# LiryBoost — Verificación real de índices y restricciones existentes (2026-10-11)

Auditoría de solo lectura en Supabase `pasoapugmsazziflaomp`. No se realizaron escrituras ni modificaciones de esquema.

## Hallazgos comprobados

### public.community_actions
- Existe índice UNIQUE parcial `community_actions_correction_once_idx` sobre `correction_of` cuando no es NULL. Impide que se inserten dos correcciones para una misma acción original, incluso bajo concurrencia.
- Existe FK `community_actions_correction_of_fkey` a `community_actions(id)` con `ON DELETE RESTRICT`.
- Hay CHECK para tipos permitidos de acción y rango de `points_delta` entre -100000 y 100000.
- Tiene índices para `member_id`, `created_by`, `occurred_at` y `action_type`.

### public.community_members
- Unicidad `crm_contact_id`.
- Índices UNIQUE parciales sobre `lower(btrim(email))` y `lower(btrim(handle))`, excluyendo valores NULL o vacíos.
- CHECK para puntos desde 0 hasta 100000000, estados y niveles admitidos.

### public.lirygames_contact_messages
- PK sobre `id`, restricciones de longitud y validación de estados, asuntos y aceptación de privacidad.
- No se observó, en los índices listados, una restricción que imponga el límite por correo de 3 mensajes/hora bajo concurrencia; el control existente en la función requiere consideración separada ante solicitudes paralelas.

## Consecuencias para LiryBoost
- La protección actual de `community_actions.correction_of` ya resuelve la unicidad de corrección a nivel de BD; no duplicar innecesariamente ni modificarla.
- NO asumir que los índices de la comunidad protegen inscripciones, consentimientos ni atribuciones de LiryBoost: hacen falta restricciones propias por operación e invitado.
- Especificar `UNIQUE(actor_user_id,operation_id)` para idempotencia y `UNIQUE(invitee_user_id)` para atribuciones definitivas, sujetos a diseño final y reglas oficiales.
- Los cambios concurrentes de consentimiento y puntos necesitan además lógica transaccional y bloqueo apropiado; los índices no cubren por sí solos todos los invariantes.

## Estado
Auditoría de lectura completada. No se creó tabla, función, índice ni política. LiryBoost sigue desactivado.
