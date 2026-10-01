# FRAGMENTUN — Supabase Auth Setup

## Flujos implementados

Frontend:
- `/admin/login`
- `/admin/forgot-password`
- `/admin/reset-password`

Backend:
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/update-password`
- `POST /api/auth/logout`
- `GET /auth/callback`

## Login
El Control Center usa email + contraseña mediante Supabase Auth.

Después de autenticar:
1. El backend obtiene el usuario real.
2. Consulta `admin_profiles`.
3. Si no existe perfil, cierra la sesión y devuelve `unauthorized`.
4. Solo usuarios con perfil administrativo pueden entrar.

## Recuperación
`/admin/forgot-password` llama a `resetPasswordForEmail`.

El redirect usado es:

`https://www.fragmentun.com/auth/callback?next=/admin/reset-password`

Para previews o desarrollo, añadir también las URLs correspondientes del entorno.

## Configuración requerida en Supabase Dashboard

Auth > URL Configuration:

Site URL:
`https://www.fragmentun.com`

Redirect URLs permitidas:
- `https://www.fragmentun.com/auth/callback`
- URLs de preview autorizadas durante QA, si se usan.

Evitar wildcards demasiado amplios en producción.

## Reset
Después del callback PKCE:
- se crea una sesión temporal válida,
- `/admin/reset-password` envía la nueva contraseña al backend,
- el backend usa `auth.updateUser({password})`,
- mínimo exigido por la aplicación: 12 caracteres.

## Logout
El botón `Cerrar sesión` llama a:
`POST /api/auth/logout`

El backend ejecuta `supabase.auth.signOut()` y la UI vuelve a `/admin/login`.

## Primer administrador
Antes de poder usar login con contraseña debe existir:
1. Usuario en Supabase Auth.
2. Fila correspondiente en `admin_profiles`.
3. Correo previamente aprobado en `admin_access_allowlist`.

Ver:
`docs/ADMIN_FIRST_ACCESS.md`

## Seguridad
- El endpoint de recuperación no revela si un correo existe.
- Login no concede acceso basándose únicamente en Auth; requiere `admin_profiles`.
- Callback solo acepta destinos que comienzan por `/admin`.
- Logout se ejecuta server-side.
- Las rutas administrativas consultan al usuario mediante `auth.getUser()`.
