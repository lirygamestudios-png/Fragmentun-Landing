# LiryBoost — Auditoría de seguridad previa al desarrollo de datos
Fecha: 2026-10-11. Estado: PREPRODUCCIÓN, NO ACTIVAR.

## Evidencia revisada
- `app/api/liryboost/top10/route.ts`: siempre llama a `readLiryBoostTop10(null)`, por lo que la salida pública permanece cerrada.
- `lib/liryboost/read-provider.ts`: exige programa activo, reglas publicadas y verificación habilitada.
- `lib/liryboost/public-leaderboard.ts`: elimina campos privados y deduplica por identificador, pero **recibe contadores ya calculados**; no prueba que esos contadores sean legítimos.
- `lib/liryboost/referral-link.ts`: valida sintaxis y hostname, pero **no genera ni comprueba el origen criptográfico del código**.
- `docs/LIRYBOOST_BORRADOR_SQL_NO_EJECUTAR.md`: borrador no migrado.

## Riesgos y controles pendientes, por prioridad

### P0: obligatorios antes de aceptar la primera inscripción
1. **Identidad real**: autenticación de servidor, verificación de elegibilidad y reglas sobre usuarios menores; un UUID con formato válido no prueba identidad ni humanidad.
2. **Estado legal**: bases oficiales, ámbito territorial, política de privacidad, consentimiento versionado, retirada y derecho de revisión. Verificar legislación aplicable antes de ofrecer beta o premios.
3. **Atribución atómica**: transacción/constraint de base de datos única por invitado; prohibir autorreferencia comparando usuario real asociado al participante; contemplar carreras y reintentos idempotentes.
4. **Permisos**: esquema no expuesto por Data API, RLS habilitada y privilegios explícitos mínimos; no publicar procedimientos SECURITY DEFINER sin revisión rigurosa.
5. **Códigos**: tokens aleatorios emitidos en servidor, digest persistido en lugar de token, expiración/rotación y revocación; hostname aprobado desde configuración confiable, nunca desde input del visitante.
6. **Conteos**: reconstrucción de ranking solo a partir de atribuciones verificadas; jamás puntos por clic ni valores enviados por el navegador.

### P1: obligatorios antes de publicar clasificación
7. **Privacidad**: alias opt-in; excluir identificadores, correos y personas invitadas del API; alias iguales no implican misma persona, contemplar representación distinguible aprobada.
8. **Fraude**: límites por cuenta/sesión, señales proporcionadas y minimización de datos, revisión de abusos y recurso para falsos positivos.
9. **Revocaciones y borrado**: definir efecto de suspensión/retiro de consentimiento sobre conteos y posiciones; registrar versionado de reglas sin filtrar información sensible.
10. **Publicación**: interruptores con estado inicial apagado y revisión por segundo responsable; rollback documentado; datos reales únicamente.

### P2: pruebas y operación
11. Tests unitarios y de integración: envíos concurrentes, dos remitentes mismo invitado, errores de red, reintentos, cuentas desactivadas, alias iguales, consentimiento retirado, tokens caducados, cookies y caché.
12. Revisar métricas y alertas sin revelar identidad: anomalías agregadas, tasa de duplicados, incidencias de validación, cambios administrativos auditables.

## Hallazgos del borrador SQL
- `UNIQUE(invitee_user_id)` evita duplicados concurrentes, pero la función transaccional y la validación de autorreferencia no existen todavía.
- El borrador no incluye tabla de eventos provisionales ni de auditoría que el modelo conceptual había previsto.
- Falta `FORCE ROW LEVEL SECURITY` como posible endurecimiento a evaluar según roles y flujo; RLS no sustituye controles sobre funciones privilegiadas ni propietario de tabla.
- El borrador necesita reglas explícitas para expiración, revocación, conservación y unicidad de códigos activos.
- El modelo define `listing_consented_at` y `participation_consented_at`, pero todavía no implementa el registro de versión de consentimiento y su revocación.
- Evitar aprobar el SQL como migración hasta revisión de acceso, índices, FK, cuentas de servicio y pruebas transaccionales.

## Decisión operativa actual
**NO GO** para lanzamiento. No activar inscripciones, referencias, conteos, premios ni Top 10. No ejecutar DDL en Supabase en esta fase. Las pruebas de código no equivalen a certificación de seguridad.

## Criterio de cierre de auditoría
Se autorizará nueva evaluación únicamente cuando existan: términos legales aprobados, modelo de identidad operativo, migraciones revisadas, permisos/RLS probados, transacciones idempotentes y pruebas de concurrencia, procedimientos de eliminación y aprobación expresa de activación.
