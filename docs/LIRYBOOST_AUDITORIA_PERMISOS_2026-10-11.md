# LiryBoost — Auditoría preliminar de permisos (2026-10-11)

## Verificación efectuada — SOLO LECTURA
- Proyecto inspeccionado: Supabase `pasoapugmsazziflaomp`.
- La consulta de tablas públicas devolvió las tablas existentes con RLS habilitado, entre ellas tablas de administración, analítica y comercio.
- No se encontró ningún esquema cuyo nombre contuviera `liryboost` (consulta a `pg_namespace`).
- Esta comprobación no demuestra que todas las políticas RLS existentes sean correctas, ni confirma que un futuro esquema privado sea inaccesible desde la API.

## Controles obligatorios antes de cualquier escritura
1. Preferir esquema privado no expuesto por Data API para eventos de consentimiento y atribuciones verificadas.
2. Verificar permisos reales de `anon`, `authenticated`, `service_role`, propietarios de funciones y `PUBLIC`.
3. Evitar `SECURITY DEFINER` público; si se justifica, mantener función en esquema no expuesto, con validación de identidad y `EXECUTE` revocado por defecto.
4. La identidad de actor se obtiene de `supabase.auth.getUser()` en servidor y el vínculo con cada participante se valida con datos del servidor.
5. RLS es defensa adicional, nunca sustituto de restricciones UNIQUE ni transacciones atómicas.
6. Comprobar que vistas y funciones no omitan involuntariamente RLS; evaluar `security_invoker`.
7. Prohibir lectura pública de eventos privados y UUID; Top 10 debe exponer solo alias consentidos y cifras verificadas.
8. Verificar restricciones UNIQUE para operación idempotente y para invitado atribuido, además de bloqueo consistente al revocar.
9. No activar inscripción hasta aprobar reglas legales, política de privacidad, elegibilidad, antifraude y pruebas concurrentes.

## Limitaciones explícitas
Auditoría preliminar; no se han enumerado aquí todas las políticas individuales, privilegios de funciones ni roles. No se ha creado esquema, tabla, función, política ni usuario nuevo.

**Estado de lanzamiento:** LiryBoost DESACTIVADO.
