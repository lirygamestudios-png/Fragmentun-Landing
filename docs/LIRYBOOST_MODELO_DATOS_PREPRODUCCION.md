# LiryBoost — Modelo de datos y controles (diseño no ejecutable)
Estado: preproducción / SIN migraciones aplicadas / SIN captación de participantes.

## Validación de inventario (2026-10-11)
En el esquema `public` de Supabase no se identificaron tablas cuyos nombres contuvieran boost, referral, invite o participant. Se requiere un segundo inventario antes de aplicar migraciones si cambia la base de datos.

## Esquema lógico propuesto
**private_liryboost.participants**: participant_id UUID PK, auth_user_id UUID UNIQUE NOT NULL, public_alias TEXT, terms_version TEXT, participation_consented_at TIMESTAMPTZ, listing_consented_at TIMESTAMPTZ, status TEXT CHECK, created_at TIMESTAMPTZ. No almacenar correos duplicados: la identidad reside en Supabase Auth.

**private_liryboost.referral_codes**: referral_id UUID PK, participant_id UUID FK, token_digest TEXT UNIQUE, created_at TIMESTAMPTZ, revoked_at TIMESTAMPTZ. Emitir tokens criptográficamente aleatorios en servidor; guardar solo digests; resolver el token por canal de servidor.

**private_liryboost.referral_events**: event_id UUID PK, referral_id UUID FK, invitee_user_id UUID, event_state TEXT, created_at TIMESTAMPTZ. Los clics no suman puntos. Retención mínima y defensa contra repeticiones.

**private_liryboost.verified_attributions**: attribution_id UUID PK, inviter_id UUID FK, invitee_user_id UUID UNIQUE, verified_at TIMESTAMPTZ, rule_version TEXT, status TEXT. Restricciones para impedir autorreferencias y acreditar únicamente invitados válidos; transacción única de verificación.

**private_liryboost.program_controls**: una configuración versionada con rules_version, rules_published_at, verification_enabled, program_active, modified_by y timestamp; únicamente personal autorizado puede modificarla.

**private_liryboost.audit_events**: actor_id, action, subject_id, reason, occurred_at. No almacenar secretos ni tokens en claro.

## Accesos
- Mantener tablas en esquema privado NO expuesto por Data API; RLS y permisos de mínimo privilegio.
- Cliente público: no escritura directa a tablas de verificación ni conteos.
- API de inscripción: solo cuando exista login verificado, términos publicados, consentimiento y límites de abuso.
- API de clasificación: solo lectura, devuelve `{programActive:false,leaderboard:[]}` hasta cumplir todas las puertas.
- Proyección pública: alias autorizado, conteo validado y posición; nunca UUID, correo, invitado ni IP.
- El alias NO es la clave de identidad; no fusionar participantes por coincidencia de alias.
- Concurrencia: UNIQUE(invitee_user_id) para impedir contabilizar una misma invitación más de una vez.

## No iniciar sin resolver
1. Elegibilidad y protección de menores conforme a territorios de operación.
2. Bases legales, clasificación de recompensas beta y política de privacidad.
3. Evidencia exacta requerida para marcar una invitación como válida.
4. Estrategia de verificación humana proporcional, apelaciones y tratamiento de falsas alarmas.
5. Calendario de retención, derecho de eliminación y revocación.
6. Auditoría de SQL, privilegios, políticas RLS y pruebas de concurrencia.
7. Aprobación expresa de activación del programa.

No ejecutar este texto como SQL; es un contrato de arquitectura para implementación posterior.
