# LiryBoost — C01: carreras reales de dos sesiones PostgreSQL locales

Implementado: `scripts/liryboost-postgres-concurrency-qa.mjs`. **No se ha ejecutado** ni se ha conectado a Supabase.

El ejecutor crea el esquema `liryboost_qa` dentro de una base local descartable llamada `liryboost_qa_disposable`, inicia **dos procesos psql independientes en paralelo** que intentan atribuir el mismo UUID sintético a promotores diferentes, y verifica exactamente un único ganador. Repite el ensayo 100 veces por defecto y elimina el esquema al salir. No guarda credenciales en el repositorio ni utiliza datos reales.

**Precondiciones:** PostgreSQL local y `psql`, Node 24, usuario y base local descartables. Variables de entorno locales (nunca Vercel ni Supabase):
```sh
LIRYBOOST_QA_ENVIRONMENT=isolated_test
LIRYBOOST_QA_APPROVAL=LIRYBOOST_LOCAL_QA_ONLY
LIRYBOOST_QA_DATABASE_URL=postgresql://LOCAL_USER:LOCAL_PASSWORD@127.0.0.1:5432/liryboost_qa_disposable
LIRYBOOST_QA_RUNS=100
```
Ejecutar: `node --experimental-strip-types scripts/liryboost-postgres-concurrency-qa.mjs`.

**Limitaciones:** esto verifica solamente la unicidad SQL de un invitado bajo carrera entre dos conexiones. No representa la función real de consentimiento, autenticación, RLS, idempotencia, revocaciones ni el pipeline de puntuación. El acceso local debe quedar físicamente aislado de bases y secretos de producción. Las siete pruebas unitarias del guard y el build no equivalen a esta prueba de estrés.
