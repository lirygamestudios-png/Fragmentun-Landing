# LiryBoost — QA C07/C08: privacidad y revocación de visibilidad

**Estado:** ensayo preparado, no ejecutado. Sin acceso a Supabase de producción.

Ejecutor: `scripts/liryboost-postgres-privacy-qa.mjs`.

El ensayo crea datos sintéticos en el esquema `liryboost_qa` de una base local descartable. Comprueba que una vista pública contenga exclusivamente `alias` y `points` (sin correo ni UUID), y que al retirar el permiso de visibilidad desaparezca en la siguiente consulta.

**No comprueba aún RLS ni los permisos reales de roles `anon`/`authenticated`**. Tampoco comprueba caché de la API pública ni configura las políticas del sistema de producción. Las pruebas completas C07/C08 siguen pendientes.

Requisitos y variables locales idénticos a `docs/LIRYBOOST_QA_SMOKE_LOCAL_EJECUCION.md`. Ejecutar solo en PostgreSQL local desechable y supervisado:
`node --experimental-strip-types scripts/liryboost-postgres-privacy-qa.mjs`.

**Criterio de salida de la próxima fase:** roles mínimos sin lectura directa de datos privados, RLS verificable en base aislada, ranking público de campos limitados, retiro de visibilidad sin caché persistente y ensayo HTTP de la API sin datos reales.
