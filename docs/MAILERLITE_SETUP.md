# FRAGMENTUN — MailerLite Setup v1.0

## Objetivo
Entregar el Capítulo 1 y nutrir lectores sin que MailerLite sea un punto único de falla.

## Grupos

Crear:
- `FRAGMENTUN_CAP1_ES`
- `FRAGMENTUN_CAP1_EN`

Guardar sus IDs como:
- `MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES`
- `MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN`

## Campos recomendados

Campos nativos:
- email
- name

Campos opcionales en MailerLite si se desea segmentación adicional:
- locale
- emotional_profile
- source
- campaign

Nota: la fuente maestra de estos datos sigue siendo Supabase.

## Automatización ES

Trigger:
- Subscriber joins `FRAGMENTUN_CAP1_ES`

Secuencia:
1. Inmediato — entrega Capítulo 1.
2. Día 2 — El precio del silencio perfecto.
3. Día 4 — Elyon no sabe por qué es diferente.
4. Día 7 — Cuando Lumen empezó a sentir.
5. Día 10 — ¿Quieres continuar la historia de Elyon?

El copy completo está en:
`docs/EMAIL_AUTOMATION_SEQUENCE.md`

## Enlaces

Para Amazon usar siempre:
`/go/amazon`

Para Patreon usar siempre:
`/go/patreon`

No enlazar directamente desde emails si queremos medir el clic dentro del dashboard propio.

## Unsubscribe

- Mantener enlace de baja del proveedor.
- No reactivar manualmente contactos dados de baja.
- No importar de nuevo a MailerLite un unsubscribed sin consentimiento nuevo verificable.

## Prueba antes de lanzamiento

1. Crear grupo ES.
2. Configurar token.
3. Registrar correo interno desde la landing.
4. Verificar subscriber en MailerLite.
5. Verificar estado `synced` en `/admin/leads`.
6. Verificar correo 1.
7. Verificar enlace de capítulo.
8. Verificar enlace Amazon.
9. Verificar baja.
10. Confirmar que el contacto dado de baja no recibe el correo siguiente.

## Fallos

Si MailerLite falla:
- El lead debe quedar guardado en Supabase.
- Estado esperado: `error` o `unconfigured`.
- Usar botón `Reintentar` en `/admin/leads` una vez corregida la configuración.

Nunca borrar el lead para intentar sincronizarlo de nuevo.

## Lanzamiento

No activar campañas de tráfico frío hasta completar una prueba real de:
- alta,
- email recibido,
- clic,
- baja.
