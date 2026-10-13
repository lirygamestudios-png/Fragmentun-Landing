# LiryBoost — Ensayo C04: revocación y acreditación simultáneas

Archivo: `scripts/liryboost-postgres-revocation-race-qa.mjs`

**Preparado, no ejecutado.** Solo para una base PostgreSQL local separada llamada `liryboost_qa_disposable`, nunca para Supabase. Mismas variables protegidas y procedimiento de `docs/LIRYBOOST_QA_SMOKE_LOCAL_EJECUCION.md`.

El ensayo abre dos sesiones psql concurrentes. Una revoca el consentimiento; la otra intenta registrar un crédito. Ambas usan un bloqueo `SELECT ... FOR UPDATE` sobre la misma fila de consentimiento. Se repite 100 veces por defecto. Después de la revocación confirmada, una operación adicional no debe generar crédito.

**Invariante:** si el crédito se confirmó ANTES de la revocación, el registro anterior puede existir; si la revocación se confirmó primero, no se admiten nuevos créditos. La política posterior de retiro de puntos o visibilidad pública todavía debe definirse y probarse.

**Alcance limitado:** utiliza tablas sintéticas aisladas, no prueba el servicio real, autorización, RLS, invalidación de ranking ni operaciones de negocio. Se requiere auditoría y ensayos adicionales antes de implementar tablas o funciones de producción.

Ejecución únicamente en servidor QA local supervisado: `node --experimental-strip-types scripts/liryboost-postgres-revocation-race-qa.mjs`. El script no forma parte de un cron, build o endpoint público.
