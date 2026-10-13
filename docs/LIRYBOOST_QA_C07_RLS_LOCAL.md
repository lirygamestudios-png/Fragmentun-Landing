# LiryBoost — C07: autorización RLS local

Script: `scripts/liryboost-postgres-rls-qa.mjs`.

**Preparado; NO ejecutado.** Solo utiliza PostgreSQL local descartable y los controles de destino en `lib/liryboost/isolated-postgres-guard.ts`. Se usa una tabla sintética con dos roles propios del ensayo: `liryboost_qa_anon` y `liryboost_qa_member`.

Controles previstos: rol anónimo sin permiso de lectura; rol miembro con una política RLS que solo muestra una fila cuando su identificador coincide; usuario ajeno con cero filas.

**No equivale a probar RLS en Supabase**, ni roles reales `anon`/`authenticated`, tokens JWT, caché, ni la API de la web. Las reglas de acceso definitivas siguen pendientes de revisión e implementación. Para ejecución usar el mismo entorno local descrito en `docs/LIRYBOOST_QA_SMOKE_LOCAL_EJECUCION.md` y el comando `node --experimental-strip-types scripts/liryboost-postgres-rls-qa.mjs`.

No activar LiryBoost ni aplicar estas políticas de ensayo a producción.
