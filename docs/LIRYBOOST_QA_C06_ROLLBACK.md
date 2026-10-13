# LiryBoost — QA C06: rollback de eventos y contadores

**Estado:** preparado, **no ejecutado**. Archivo `scripts/liryboost-postgres-rollback-qa.mjs`.

## Alcance
En una base PostgreSQL **local y descartable**, el ensayo crea tablas sintéticas de eventos y contadores, comienza una transacción e inyecta un error de SQL después de crear ambas filas y antes del commit. Verifica que no persista ningún evento ni contador; después comprueba que un intento válido registre un evento y un único incremento.

## Condiciones de uso
Aplicar las precondiciones y variables definidas en `docs/LIRYBOOST_QA_SMOKE_LOCAL_EJECUCION.md`. Ejecutar solo bajo supervisión local con `node --experimental-strip-types scripts/liryboost-postgres-rollback-qa.mjs`. El guard rechaza destinos remotos y nombres de bases diferentes de `liryboost_qa_disposable`.

## Límites
Este ensayo comprueba la atomicidad de una transacción SQL sintética, **no** la entrega de eventos reales, pérdida de conexión, reintentos distribuidos, RLS, consentimientos ni el servicio de acreditación de LiryBoost. No cambiará la base de producción ni activará el programa. Se requiere ejecución real y revisión del resultado antes de cerrar el caso C06.
