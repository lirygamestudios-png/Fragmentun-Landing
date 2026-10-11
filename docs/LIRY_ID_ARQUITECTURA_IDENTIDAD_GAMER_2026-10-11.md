# LIRY ID — Arquitectura segura de identidad gamer (propuesta técnica)
Fecha: 2026-10-11. Estado: diseño, NO autenticación activada.
Rama: work/master-admin-implementation. Alcance exclusivo LIRYGAMES FrontDesk. Commander Center y FRAGMENTUN no se modifican.

## Principios obligatorios
- Liry ID es una identidad de público/jugador, distinta del administrador y de cualquier mecanismo de autorización editorial.
- Nunca autorizar funciones administrativas en función de una sesión gamer. Comprobar autorización en el servidor para **cada** solicitud.
- No mezclar perfiles de FRAGMENTUN con LIRYGAMES ni reutilizar tablas de perfil administrativo como fuente de datos gamer.
- Mientras no exista sesión verificable el estado público es visitante. Las métricas no se inventan.
- Registro, inicio de sesión y recuperación permanecen desactivados; no crear cuentas, enviar emails ni pedir contraseñas en la UI preliminar.

## Modelo lógico propuesto (pendiente de migración revisada)
- gamer_profiles: id UUID vinculado a la identidad autenticada, alias público opcional y moderado, estado y timestamps. Email privado administrado exclusivamente por proveedor Auth, no en perfil público.
- gamer_preferences: user_id UUID, preferencias y consentimientos versionados, visibilidad y borrado.
- gamer_avatars: propietario UUID, ruta de archivo privada; subida restringida con tamaño/formato, evaluación de imagen y procesamiento seguro. Ninguna URL pública permanente sin aprobación explícita.
- game_activity_events: identificador idempotente, user_id, código público de juego, origen firmado en servidor, tipo de evento, timestamp; escritura solo desde servidor de juego autorizado. Nunca confiar en valores XP enviados desde navegador.
- gamer_balances: XP calculados por transacción o proyección a partir de eventos validados; mantener auditabilidad y control antifraude.
- gamer_achievements: relación usuario/juego/logro, evento origen y fecha de concesión verificada, sin inserción directa del cliente.
- gamer_inventory: derechos de ítems entregados por evento verificado de compra o recompensa; idempotencia y trazabilidad.
- gamer_purchase_events: identificador de pasarela, estado y comprobación de firma en servidor; no aceptar resultado de pago afirmado por cliente.

## Autenticación y seguridad
1. Mantener proveedor de autenticación revisado (Supabase Auth si se decide conservarlo), con email verificado antes de usar funciones sensibles; recuperación vía enlace con expiración y control contra enumeración.
2. MFA para operaciones sensibles según riesgo, medidas anti-bot y límites de intentos; no guardar contraseñas en tablas propias ni registrar tokens en logs.
3. Evaluar la mejor separación de identidades: proyecto Auth distinto para gamers vs. admin, o aislamiento completo por esquema y claims emitidos exclusivamente en backend, RLS y verificación rigurosa. Opción recomendada para máximo aislamiento: **proyecto Auth y almacenamiento separados**, sujeto a evaluación de operación, presupuesto y cumplimiento.
4. Políticas RLS con propietario exacto auth.uid() para datos propios y ninguna política pública que permita escribir XP, inventario, logros, roles o actividad. Autorizar solo mediante servicio verificado con permisos mínimos.
5. Validar identidad en cada operación, no confiar solo en un user_id, alias o rol entregado por navegador. No usar user_metadata como fuente de privilegios.
6. Disponer controles de supresión/descarga, auditoría, retención, consentimiento y edad **antes** de habilitar cuentas.

## Contrato FrontDesk y etapas
- VISITANTE: vista anónima; avatar de sesión no transmitido, Liry ADN sin permanencia, XP y contadores vacíos.
- REGISTRADO: cuando Auth y políticas estén listos, identidad y preferencias de cuenta; XP vacío si aún no hay partida verificada.
- JUGADOR ACTIVO: obtiene datos únicamente desde eventos del servidor de videojuegos conectados. La cantidad de juegos publicados no implica juegos jugados.
- Solo ofrecer botones funcionales de registro, acceso, recuperación y cierre de sesión cuando exista backend probado, políticas vigentes y canales legales aprobados.

## Criterios de aceptación antes de activar
- Sesiones admin y gamer no conceden acceso mutuo; tests negativos entre dominios y roles.
- Ataques de IDOR, escritura directa de métricas, repetición de pagos, manipulación de referidos y cargas maliciosas rechazados.
- Recuperación no revela existencia de correo, evita redirecciones no autorizadas y revoca sesiones según reglas.
- Pruebas de mayor/menor de edad, consentimiento, borrado y no retención de avatar temporal.
- Perfil sobre móvil y escritorio conserva subpantallas sin salto de scroll.
- Pruebas de seguridad, revisión de políticas legales y aprobación del operador antes de habilitar.

## Estado
La UI Liry ID actual es puramente informativa. NO se han creado tablas ni modificado Supabase Auth, RLS, políticas administrativas o pasarelas.
