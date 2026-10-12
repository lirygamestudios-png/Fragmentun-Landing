# LiryBoost — Revisión de funciones administrativas existentes (2026-10-11)

Auditoría ejecutada en modo SOLO LECTURA sobre Supabase `pasoapugmsazziflaomp`. Ningún permiso fue modificado.

## Evidencia verificada
- `private.is_admin`, `private.is_admin_or_editor` y `private.is_admin_or_marketing` son funciones SQL `STABLE SECURITY DEFINER` que consultan `public.admin_profiles` y comparan `user_id = auth.uid()` con los roles exigidos.
- Las tres definen `search_path=public`; emplean nombres cualificados para la consulta de perfiles y `auth.uid()`.
- `anon` tiene permiso EXECUTE sobre estas funciones, pero NO USAGE sobre el esquema privado: esto impide una llamada directa ordinaria bajo ese rol, aunque corresponde comprobar la exposición de funciones a través de otras rutas.
- `authenticated` tiene USAGE sobre el esquema privado y permiso EXECUTE en las tres funciones; devuelven booleanos basados en su identidad, no filas de perfiles.
- `private.sync_admin_profile_from_auth` es también SECURITY DEFINER; la consulta inicial de permisos indicó que ni `anon` ni `authenticated` tienen EXECUTE.
- Estas verificaciones no prueban la seguridad integral de todas las funciones ni políticas existentes.

## Evaluación provisional
No se observó, en el cuerpo de las tres funciones consultadas, una lectura irrestricta de perfiles ajenos para los usuarios comunes. No obstante, `SECURITY DEFINER` eleva privilegios y necesita revisión específica: propietario, rutas de ejecución, grants efectivos y dependencias.

## Controles antes de implementar LiryBoost
1. No reutilizar las funciones administrativas como mecanismo de identidad de jugadores.
2. Separar tablas y funciones de LiryBoost en un esquema controlado no expuesto por la API.
3. Auditar los grants por roles y evitar EXECUTE a PUBLIC cuando no sea necesario.
4. Resolver identidad con `auth.getUser()` y vínculo de propiedad del servidor.
5. Preparar pruebas que demuestren que los clientes anónimos no pueden escribir consentimientos ni invitaciones.
6. No activar datos ni programa hasta revisar condiciones legales, protección de menores, RLS y atomicidad.

**Estado:** diagnóstico preliminar; LiryBoost inactivo. No se ejecutaron DDL ni DML.
