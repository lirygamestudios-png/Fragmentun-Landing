# LiryBoost — Integridad referencial y permisos mínimos (revisión previa)

**Estado:** preproducción, SOLO DISEÑO. Consultas en Supabase fueron de lectura; no se ejecutaron migraciones.

## Hallazgo del sistema existente
En `public.community_members`, la clave `created_by` referencia `auth.users(id)` con `ON DELETE SET NULL`: identifica al administrador creador, **no al propietario autenticado del participante**. `crm_contact_id` referencia `crm_contacts(id)` con `ON DELETE SET NULL`. Por tanto, no reutilizar estas columnas como prueba de identidad de jugadores.

## Claves y relaciones propuestas (sujetas a revisión)
1. Participantes: `participant_id` PK UUID; `owner_user_id` FK a `auth.users(id)`, UNIQUE y NOT NULL. La eliminación de cuentas exige un flujo explícito de privacidad/retención; no seleccionar CASCADE o RESTRICT sin política aprobada.
2. Consentimientos: `event_id` PK UUID; FK `owner_user_id` al propietario del participante, con `UNIQUE(owner_user_id, operation_id)` y `UNIQUE(owner_user_id,event_sequence)`; `rules_version` FK a versión publicada de bases. Considerar FK compuesta para evitar vinculación cruzada.
3. Revocaciones: guardar referencia a evento `accepted` del mismo usuario; verificar tipo y propiedad dentro de una transacción (una FK simple no garantiza que el evento citado sea aceptación del mismo actor).
4. Permiso de aparecer en Top 10: registro/historial independiente, asociado a participante y versión de consentimiento; ningún alias equivale automáticamente a permiso público.
5. Invitaciones: FK `referrer_user_id` y `invitee_user_id` a identidades elegibles; `UNIQUE(invitee_user_id)` para acreditaciones **confirmadas**. Si se guardan intentos rechazados en la misma tabla, usar diseño separado o índice parcial para no bloquear definitivamente a un invitado por un intento inválido.
6. Comprobar `referrer_user_id <> invitee_user_id` en la BD. No asumir que un correo o alias es una identidad única.
7. Estado del programa: fuente protegida, independiente del navegador y desactivada por defecto.

## Acceso mínimo
- `anon`: sin lectura ni escritura de participantes, eventos privados o invitaciones; acceso únicamente al endpoint público sanitizado.
- `authenticated`: sin operaciones directas sobre tablas internas salvo políticas específicas y justificadas; identidad resuelta por servidor y revisada dentro del procedimiento.
- Administradores: consultar métricas agregadas según rol; acceso a evidencia sensible restringido, auditado y no necesariamente compartido con rol de marketing.
- Servicio/funciones internas: solo permisos imprescindibles; evitar exponer `SECURITY DEFINER` a esquemas públicos y revocar EXECUTE implícito a PUBLIC donde proceda.
- Lectura Top 10: estado publicado + alias autorizado + conteos efectivamente confirmados, sin UUID ni datos privados.

## Pruebas bloqueantes previas a migración
- FK de consentimientos no acepta eventos de otra cuenta.
- Revocación no permite referir aceptación ajena o inexistente.
- Dos transacciones que reclaman mismo invitado no obtienen dos acreditaciones.
- Un intento rechazado no consume para siempre unicidad de invitado.
- Usuario anónimo o sin propiedad no puede consultar ni insertar registros internos.
- Baja o supresión de cuenta respeta política de privacidad y conservación aprobada.
- Revocación de autorización pública excluye la siguiente lectura del Top 10.

## Puerta de decisión
Aún falta aprobar bases, elegibilidad de menores, conservación de datos, permisos/RLS detallados y estrategia de borrado. No convertir esta especificación en SQL aplicado hasta esas decisiones y pruebas en ambiente aislado.
