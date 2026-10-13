# LiryBoost — Ejecución segura del smoke test local PostgreSQL

Este script **no fue ejecutado** y no usa Supabase. Requiere Node 24 y el cliente `psql` instalado junto a un servidor PostgreSQL **local, independiente y descartable**.

Antes de ejecutarlo, crear manualmente una base de datos local denominada exactamente `liryboost_qa_disposable`, con un usuario de pruebas aislado. No usar credenciales ni volúmenes de producción.

Variables que se deben proporcionar *solo en un entorno aislado*:
- `LIRYBOOST_QA_ENVIRONMENT=isolated_test`
- `LIRYBOOST_QA_APPROVAL=LIRYBOOST_LOCAL_QA_ONLY`
- `LIRYBOOST_QA_DATABASE_URL=postgresql://<usuario_local>:<password_local>@127.0.0.1:5432/liryboost_qa_disposable`

Comando: `node --experimental-strip-types scripts/liryboost-postgres-qa.mjs`.

El script rechaza destinos remotos, bases sin el nombre indicado, aprobaciones ausentes y URLs con parámetros extra; ejecuta una prueba de unicidad mediante `ON CONFLICT DO NOTHING`; elimina el esquema de pruebas al terminar. **No simula simultaneidad real entre conexiones**, no valida consentimiento/RLS ni sustituye C01–C08 del plan integral. No activar LiryBoost ni modificar el entorno de producción con este procedimiento.

Estado: implementación preparatoria en rama `work/master-admin-implementation`; requiere ensayo local supervisado.
