# LIRYGAMES — Auditoría de concurrencia y límites de contacto (2026-10-11)

Inspección de solo lectura de código y PostgreSQL. No se aplicaron cambios a Supabase ni al diseño del FrontDesk.

## Defensa confirmada
- El endpoint `app/api/lirygames/contact/route.ts` consulta `consumePublicRateLimit` con ventana de 3,600 s y límite de 5 solicitudes por clave de IP/discriminador, antes de validar tamaño, contenido y Turnstile.
- El formulario exige verificación Turnstile antes de invocar la función de almacenamiento.
- `public.ingress_rate_limits` tiene índice único sobre `(route,key_hash,window_start)`, apto como base para conteo atómico si la RPC `consume_rate_limit` utiliza una operación transaccional apropiada.
- `public.lirygames_contact_messages` tiene índice único para `id`, pero no existe una restricción única por correo/ventana.
- `public.lirygames_submit_contact` limita a tres mensajes por correo en la última hora mediante `count(*)` previo al `INSERT`. **Ese control aislado no garantiza el máximo bajo solicitudes concurrentes**.

## Riesgos y alcance
1. `lib/rate-limit.ts` utiliza `localFallback` en memoria cuando falla la llamada de control central; el contador no está sincronizado entre instancias y no equivale a protección global. Una estrategia fail-closed para formularios sensibles reduciría este riesgo pero podría afectar disponibilidad: requiere decisión, pruebas y despliegue controlado.
2. La clave de IP usa `x-forwarded-for` primero; confirmar el modelo de proxy y encabezados confiables para impedir que una cabecera controlable por el cliente altere los límites.
3. La consulta por correo en el procedimiento de contacto no es una protección transaccional contra carreras; estudiar una reserva de cupos o bloqueo de clave de correo en base de datos si el negocio exige límite estricto.
4. La verificación de Turnstile disminuye abuso automatizado, pero no sustituye unicidad ni comprobación de estado persistido.

## Próximos pasos sin modificar producción
- Inspeccionar cuerpo de `consume_rate_limit` para confirmar atomicidad.
- Añadir pruebas de fallos del contador central y del entorno multiinstancia en una fase separada.
- Aplicar a LiryBoost un bloqueo **estricto, sin fallback local** para acreditaciones e inscripciones si se implementan endpoints futuros.
- No reutilizar el límite de tres correos como si fuese control de invitaciones verificadas.

**Estado:** auditoría preliminar. Ninguna vulnerabilidad explotable comprobada; ninguna migración aplicada. LiryBoost sigue inactivo.
