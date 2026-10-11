# FrontDesk — Contrato de datos gamer (10 octubre 2026)

## Implementado
- Estado público explícito: visitor, identified_no_activity, verified.
- El estado inicial queda fijado en visitor con actividad nula; no se deducen juegos, XP ni logros a partir de visitas al sitio.
- El FrontDesk lee el contrato sin acceso nuevo a Supabase, sin cambios al Commander Center.
- No se habilitan cuentas, recompensas ni telemetría en esta fase.

## Puertas de aprobación antes de conectar datos reales
1. Identidad gamer independiente y sesión validada en servidor.
2. Fuente autorizada de eventos firmados o verificables de juego.
3. Estado published de juego y Release Gate aprobado para el mismo videojuego y despliegue.
4. Agregación con control de duplicados, reglas antiabuso y límites de autorización.
5. Permisos de lectura por cuenta, protección de PII y revisión de seguridad.
6. Pruebas de transición visitor -> identified_no_activity -> verified sin valores ficticios.
7. Inspección visual antes de activar.

## Nota de IP
Los códigos públicos no otorgan autorización para publicar títulos internos. Continúa pendiente la verificación HTTP de recursos históricos y artefactos públicos anteriores.
