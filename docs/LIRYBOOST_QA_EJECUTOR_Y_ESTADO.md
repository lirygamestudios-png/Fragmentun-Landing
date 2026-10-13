# LiryBoost — coordinación de ensayos PostgreSQL aislados

Ejecutor: `scripts/liryboost-postgres-qa-suite.mjs`.

**Estado:** agregado al repositorio; NO ejecutado. El entorno actual no dispone de los binarios `psql`, `postgres` ni `initdb`, por lo que no existe evidencia de que los casos SQL estén aprobados. Nunca apuntar el ejecutor a Supabase.

## Ejecución supervisada
Requiere un PostgreSQL local descartable, psql y Node compatible con TypeScript strip types. Variables:
- `LIRYBOOST_QA_ENVIRONMENT=isolated_test`
- `LIRYBOOST_QA_APPROVAL=LIRYBOOST_LOCAL_QA_ONLY`
- `LIRYBOOST_QA_DATABASE_URL=postgresql://<local_user>:<local_password>@127.0.0.1:5432/liryboost_qa_disposable`

Ejecutar `node --experimental-strip-types scripts/liryboost-postgres-qa-suite.mjs` **solo** tras confirmar que la conexión y la base pertenecen al entorno aislado.

Se detiene en el primer fallo. Incluye casos sintéticos de ganador único, idempotencia, revocación, reversión de transacciones, privacidad y política RLS.

## Pendientes bloqueantes
- Ejecutar en PostgreSQL local y conservar registros de la corrida.
- Auditar escenarios SQL, incluidas diferencias entre acceso local y autenticación real Supabase.
- Ensayar las rutas de servidor con transacciones y lectura consistentes.
- Revisar Términos, consentimiento, elegibilidad, premios y moderación.
- Obtener aprobación antes de crear funciones o tablas en el entorno real o habilitar LiryBoost.

**Advertencia:** que Vercel alcance READY no significa que estas pruebas de PostgreSQL se hayan ejecutado: son scripts de QA fuera del build.
