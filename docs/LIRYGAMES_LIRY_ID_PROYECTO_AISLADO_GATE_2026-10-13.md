# LIRYGAMES STUDIOS — Puerta de aprovisionamiento LIRY ID (2026-10-13)

## Resultado de la auditoría real
La cuenta Supabase conectada expone un único proyecto: **FRAGMENTUN** (ref `pasoapugmsazziflaomp`). No se ha localizado un proyecto exclusivo para LIRYGAMES. Por ello **no conectar LIRY ID al cliente Supabase actual**, ni habilitar registro, inicio de sesión o recuperación desde la web.

## Requisitos para desbloquear tarea 1 del FrontDesk
1. Disponer de un proyecto Supabase diferente, de propiedad y ámbito LIRYGAMES, con costos aprobados previamente.
2. Configurar en Vercel solo para el entorno apropiado `LIRY_GAMER_SUPABASE_URL` y `LIRY_GAMER_SUPABASE_PUBLISHABLE_KEY`, sin imprimir sus valores en registros, documentación o código.
3. Garantizar que el proyecto gamer no comparte URL, claves, cookies, usuarios administrativos, tablas ni roles privilegiados con FRAGMENTUN. Nunca exponer claves secretas o service_role al navegador.
4. Diseñar el esquema de perfiles propios y políticas RLS por propietario, incluyendo `USING` y `WITH CHECK` en actualizaciones, antes de la primera alta.
5. Validar verificación por servidor mediante `auth.getUser`, audiencia/identidad gamer propia y políticas de sesiones, caducidad y recuperación.
6. Decidir edades permitidas, información mínima, consentimiento, política de privacidad, borrado de cuenta, correo transaccional y límites antiabuso.
7. Ejecutar pruebas de cuenta nueva, correo no confirmado, errores de login, recuperación, sesiones caducadas, acceso cruzado admin/gamer, y dispositivos móviles.
8. Solo tras pruebas, aprobación y verificación visual permitir gradualmente los endpoints de alta, acceso y recuperación; sin cambiar la composición de las subpantallas del FrontDesk.

## Estado y próximos pasos
- `lib/games/liry-auth-project-isolation.ts`: validación preparatoria de URL y clave distintas; NO autentica personas.
- `lib/games/liry-auth-server-configuration.ts`: informa configuración; mantiene todas las operaciones desactivadas.
- `/api/lirygames/liry-id/status`: endpoint cerrado, sin datos administrativos.
- **Bloqueo real:** falta proyecto gamer independiente. No sustituirlo por supuestos, mocks publicados ni el proyecto FRAGMENTUN.
- **Política de gasto:** cero recursos con costo sin autorización expresa.
- **Ámbito:** solo FrontDesk de LIRYGAMES; Commander Center continúa en pausa.

Esta auditoría está basada en la lista de proyectos visibles en la conexión actual. Si hubiera otro proyecto bajo otra cuenta no conectada, su existencia aún no ha sido verificada.
