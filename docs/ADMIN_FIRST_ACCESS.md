# FRAGMENTUN — Primer acceso administrativo

## Estado actual
La seguridad del Control Center usa dos capas:

1. `admin_access_allowlist`: define qué correos pueden tener acceso y qué rol corresponde.
2. `admin_profiles`: vincula un usuario autenticado de Supabase Auth con su rol efectivo dentro del panel.

La allowlist ya contiene el correo administrativo principal. El perfil efectivo se crea una vez que existe el usuario Auth correspondiente.

## Primer acceso

Antes del lanzamiento público:

1. Crear o invitar el usuario administrativo principal en Supabase Auth usando el mismo correo presente en `admin_access_allowlist`.
2. Iniciar sesión una vez mediante magic link.
3. Obtener el `user_id` generado por Supabase Auth.
4. Crear la fila correspondiente en `public.admin_profiles` con:
   - `user_id`
   - `display_name`
   - `role=admin`
5. Verificar acceso a `/admin`.
6. Confirmar que el panel Estado del sistema muestra perfiles administrativos aprovisionados.

## Regla de seguridad
Nunca crear un `admin_profile` para un correo que no esté previamente en `admin_access_allowlist`.

## Roles admitidos
- admin
- editor
- marketing

## Verificación
El estado esperado antes de producción es:
- Allowlist: al menos 1.
- Admin profiles: al menos 1.
- Acceso a `/admin`: correcto.
- Usuario no autorizado: sin acceso al panel.

## Nota
Este paso es deliberadamente manual para el primer administrador. Después, la gestión de usuarios internos se realiza desde el Control Center.
