# LIRYGAMES STUDIOS — Integración futura Liry ID
Estado: preparación inactiva (11 de octubre de 2026).

## Separación obligatoria
- Identidad del visitante público y autenticación gamer separadas del sistema de administración.
- Un perfil privado es propiedad de una cuenta verificada. No se obtiene ni actualiza mediante parámetros del navegador.
- El estado de jugador activo requiere eventos emitidos y autorizados por el servidor del videojuego.
- El FrontDesk no calcula resultados de juego reales a partir de clics, encuestas o visitas.

## Contrato de lectura seguro
`lib/games/liry-integration-gateway.ts` agrupa la proyección pública de identidad, preferencias, vínculos y actividad. Actualmente entrega exclusivamente el estado visitante, preferencias predeterminadas, los nueve mundos NO CONECTADO y ninguna actividad. Los cuatro puertos de integración siguen en `not_configured`.

## Secuencia para una futura activación
1. Definir y auditar un proveedor de autenticación gamer independiente.
2. Configurar acceso a perfiles privados con protección por titularidad.
3. Registrar consentimientos y aplicar minimización de datos.
4. Autenticar servidores de juego y vincular códigos públicos a juegos publicados.
5. Validar eventos únicos, autorización, idempotencia, revocación y trazabilidad.
6. Probar desconexiones, reintentos, integridad, permisos y privacidad.
7. Revisar obligaciones legales y realizar una corrida funcional completa antes de activar.

## Prohibiciones vigentes
No mostrar datos de usuario, XP, partidas, premios, enlaces o resultados ficticios. No activar formularios de credenciales ni enlaces a tiendas inexistentes. No exponer nombres de IP antes de su registro. No cambiar Liry ID ni Privacidad aprobados. No modificar Commander Center.
