# LiryBoost — Propuesta de restricciones PostgreSQL (NO EJECUTAR)

**Estado:** diseño técnico para revisión. NO es una migración aplicada y NO habilita LiryBoost.
**Alcance:** nuevas tablas aisladas en esquema privado, pendientes de revisión del esquema real y del modelo legal.

## Identidad y operaciones
- El actor se deriva únicamente de una identidad autenticada mediante `auth.getUser()` en el servidor; jamás de `actorId` enviado por el visitante.
- Una tabla privada de operaciones conserva `actor_user_id UUID NOT NULL`, `operation_id UUID NOT NULL`, `operation_kind`, `rules_version`, `event_sequence`, `recorded_at` y `payload_digest`.
- Restricciones propuestas: `UNIQUE(actor_user_id,operation_id)`; `UNIQUE(actor_user_id,event_sequence)`; `CHECK (operation_kind IN ('accepted','withdrawn'))`; longitudes y formatos acotados para reglas.
- Al reintentar: recuperar el evento existente, comparar tipo, versión, sujeto y huella canónica del contenido. Una diferencia da conflicto sin escribir nada.
- Un `operation_id` nuevo sobre una aceptación todavía vigente también requiere reglas de transición explícitas: no permitir aceptación duplicada o revocación sin aceptación.
- Timestamp UTC asignado por servidor de base de datos; no usar hora del navegador para ordenar ni probar consentimiento.

## Atomicidad
- Función de servidor con una transacción única, privilegios mínimos y bloqueo por actor; validar sesión, pertenencia, versión publicada, consentimiento vigente y autorización de operación dentro de ella.
- Insertar evento append-only, secuencia y estado proyectado en la misma transacción.
- Revocación y acreditaciones de invitaciones deben compartir protocolo de bloqueo consistente; las carreras se resuelven en base de datos, no con código JavaScript.
- Los fallos se revierten por completo. No responder `committed` sin confirmación real.

## Invitaciones verificadas
- Tabla privada de atribuciones: `invitee_user_id UUID NOT NULL UNIQUE`; registrar `referrer_user_id` y la verificación independiente de identidad, elegibilidad y consentimiento.
- Evitar autoreferidos con `CHECK (invitee_user_id <> referrer_user_id)`.
- La clave única por invitado evita acreditar a dos promotores simultáneamente por una sola persona; una transacción decide el resultado.
- La clasificación pública deriva de atribuciones efectivamente confirmadas y participantes con permiso de aparición vigente.

## Seguridad de datos
- Verificar el esquema real antes de escoger RLS, `SECURITY DEFINER`, roles y RPC. No crear endpoints públicos de escritura sin esa auditoría.
- Evitar datos de contacto, sesiones e IP en el historial; el plazo de retención dependerá de la política legal aprobada.
- Auditoría separada de administradores y accesos, sin exponer UUID en Top 10.
- Bloquear lanzamiento mediante configuración del servidor hasta completar pruebas de integración y aprobación de bases oficiales.

## Pruebas pendientes antes de ejecutar
1. Dos transacciones simultáneas con igual clave: exactamente un evento.
2. Misma clave con otro contenido: conflicto, ninguna mutación.
3. Revocación y acreditación simultáneas: orden determinista y sin atribución posterior a revocación.
4. Dos promotores y un invitado: máximo una atribución.
5. Error a mitad de transacción: rollback completo.
6. Actor sin sesión: cero escrituras.
7. RLS y funciones: permisos estrictamente limitados.

**Decisión:** no ejecutar DDL, migraciones ni inserts en Supabase hasta inspección del esquema actual y autorización expresa de activación técnica.
