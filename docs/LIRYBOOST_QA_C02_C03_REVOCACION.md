# LiryBoost — QA aislada C02, C03 y revocación secuencial

**Estado:** scripts preparados; nunca ejecutados contra PostgreSQL ni Supabase.

Archivo: `scripts/liryboost-postgres-idempotency-consent-qa.mjs`.

Comprueba con UUID sintéticos:
1. C02: la repetición de la misma clave de operación no genera un segundo evento.
2. C03: la misma clave con contenido diferente se identifica como conflicto y no se escribe.
3. Revocación previamente confirmada: un invitado cuyo último consentimiento es `revoked` no genera un nuevo crédito.

**No realiza carreras reales de sesiones ni reemplaza C04**, que deberá ensayar revocación frente a acreditación simultánea, con bloqueos y orden de confirmación explícitos. Tampoco constituye un servicio operativo de consentimientos ni modifica el esquema real de producción.

Prerequisitos y variables: exactamente los del documento `docs/LIRYBOOST_QA_SMOKE_LOCAL_EJECUCION.md`. Ejecución: `node --experimental-strip-types scripts/liryboost-postgres-idempotency-consent-qa.mjs` en un PostgreSQL local descartable cuyo nombre sea `liryboost_qa_disposable`.

**Prohibido** proporcionar credenciales de Supabase o desplegar este comando como tarea de producción.
