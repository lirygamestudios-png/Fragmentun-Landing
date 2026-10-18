# FRAGMENTUN — Verificación segura de MailerLite (operación manual)

Este procedimiento NO inscribe contactos, no crea grupos y no envía correos.
Ejecutarlo únicamente desde un equipo autorizado para el proyecto Vercel
`fragmentunweblandingoficial01`, conectado al equipo `lirygamestudios-7579`.

## Preparación
1. Abrir una terminal en una copia de este repositorio y seleccionar la rama
   `fix/fragmentun-mailerlite-isolated-20261018`.
2. Autenticarse en Vercel CLI y vincular la carpeta al proyecto correcto
   mediante `vercel link --scope lirygamestudios-7579` si todavía no lo está.
3. Confirmar el proyecto vinculado antes de la siguiente orden.

## Comprobación de solo lectura (no guardar secretos en disco)
```sh
vercel env run -e production -- node scripts/fragmentun-mailerlite-readonly-preflight.mjs
```

La orden inyecta las variables de producción **solo en ese proceso local**.
El script emite `ES capture group: VERIFIED` y `EN capture group: VERIFIED`
cuando el token puede consultar los IDs de ambos grupos. Si hay un error,
devuelve código distinto de cero. No imprimir variables ni compartir logs
que contengan secretos. Ejecutar la orden solo si la versión de Vercel CLI
instalada admite `env run`.

## Interpretación
- **Ambos VERIFIED:** el token reconoce ambos grupos en la cuenta a la que
  pertenece. NO demuestra que se entregó un email.
- **NOT FOUND:** detener; no reemplazar automáticamente el ID y verificar
  qué cuenta está representada por el token de producción.
- **HTTP 401/403:** revisar acceso/token con administrador autorizado.
- **Missing/invalid configuration:** comprobar la configuración en Vercel
  sin pegar secretos en chats o incidencias.
- **Error de paginación:** no tomarlo como confirmación de ninguno de los grupos.

## Antes de publicar
Mantener PR #2 en borrador. Después de confirmar ambos grupos, realizar una
prueba de suscripción consentida por un responsable, revisar el registro en
Supabase, la pertenencia al grupo y la llegada del primer correo. No volver a
suscribir automáticamente los cinco registros históricos inconsistentes.
