# LIRYBOOST — Contrato de activación segura (preproducción)

Estado: **NO ACTIVO**. Este documento NO autoriza capturar datos, registrar participantes, atribuir invitaciones ni publicar rankings.

## Reglas no negociables
1. La inscripción requiere bases oficiales publicadas, política de privacidad, consentimiento verificable y capacidad de revocación.
2. Cada participante tiene un identificador interno estable (UUID) distinto de su alias público; un alias no representa identidad ni sirve para deduplicar personas.
3. La invitación se atribuye mediante un identificador aleatorio opaco de referencia, emitido por servidor y asociado al participante; nunca debe incluir correo, nombre, clave administrativa ni IP original de videojuego.
4. Un clic, compartir enlace, vista o registro incompleto **no** constituye una invitación verificada.
5. Solo se contabiliza una invitación cuando el invitado es una persona/cuenta única cuya identidad y elegibilidad se verifican, con consentimiento aplicable, sin autorreferencia ni duplicación. Registrar evidencia y reglas antifraude minimizando datos.
6. Evitar que un mismo invitado genere crédito para varias personas. Definir reglas de atribución (primera referencia elegible) y ventana de validez antes de lanzar.
7. Detectar autorreferencias, patrones de bots, registros masivos y actividad sospechosa; poner en revisión las atribuciones cuestionables, sin castigar automáticamente usuarios legítimos.
8. Nunca revelar correos, IP, identificadores, URLs de referencia internas ni datos de invitados en el Top 10 público. Mostrar solo alias autorizados y conteos verificados.
9. Recalcular el ranking a partir de invitaciones verificadas, no de acumuladores editables desde el cliente. Desempate determinista documentado.
10. Tener mecanismos de retirada de consentimiento, rectificación, apelación, auditoría administrativa y retención/borrado de datos; proteger RLS y operaciones con privilegios mínimos.

## Modelo conceptual propuesto (no migrar automáticamente)
- `participants`: id UUID, auth_user_id único, public_alias, created_at, participation_consent_at, listing_consent_at, status.
- `referral_codes`: id UUID, participant_id, token_hash único, issued_at, revoked_at.
- `referral_events`: id UUID, referral_code_id, invitee_user_id, created_at, provisional_state, verification_reference.
- `verified_attributions`: id UUID, inviter_id, invitee_user_id único, verified_at, verification_rule_version, status.
- `program_controls`: published_rules_version, rules_published_at, verification_enabled, program_active, updated_by, updated_at.
- `audit_events`: actor, action, entity, timestamp, reason; acceso restringido.

Los nombres son orientativos. Antes de crear tablas se deberá revisar la estructura existente, la base legal aplicable, la privacidad de menores y el consentimiento.

## Contrato del Top 10
- Endpoint de solo lectura, `Cache-Control: no-store`.
- Estado inactivo: `{programActive:false,leaderboard:[]}`.
- Activar solo con reglas publicadas, verificación confiable, controles de fraude y autorización del responsable.
- Agrupar por id de participante en servidor; nunca por alias. Aceptar alias duplicados sin fusionar identidades, con una presentación diferenciable que no exponga información privada.
- Publicar exclusivamente resultados reales y autorizados; cero posiciones ficticias.

## Fases pendientes
1. Revisión legal y consentimiento; bases de competición (incluye criterios de elegibilidad y recompensas beta).
2. Diseño de identidad/verificación y estados de inscripción.
3. Modelo de datos + migraciones y políticas RLS auditables.
4. Código/referral links + atribución verificable server-side + límites antifraude.
5. Motor de ranking público + controles de publicación + auditoría.
6. Pruebas de seguridad, concurrencia, duplicados, revocaciones, abuso y dispositivos móviles.
7. Validación visual/funcional del FrontDesk y Commander Center; habilitación solo por decisión explícita.

## Integración existente
- `app/api/liryboost/top10/route.ts` pasa actualmente `null` a `readLiryBoostTop10`; permanece inactivo.
- `components/LiryBoostEnrollment.tsx` mantiene todos los campos deshabilitados.
- `lib/liryboost/read-provider.ts` exige tres puertas antes de divulgar ranking.
- No enlazar estas piezas a datos reales hasta completar las fases anteriores.
