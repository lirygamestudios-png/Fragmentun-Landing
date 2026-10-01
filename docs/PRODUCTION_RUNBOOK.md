# FRAGMENTUN — Production Runbook v1.0

## Objetivo
Publicar la landing de FRAGMENTUN con captación, analytics, Amazon, Patreon y Control Center funcionando sin perder leads.

## 1. Variables obligatorias

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Sitio
- `NEXT_PUBLIC_SITE_URL=https://www.fragmentun.com`

### Patreon
- `NEXT_PUBLIC_PATREON_URL=https://patreon.com/sagaFragmentun?utm_source=fragmentun&utm_medium=website&utm_campaign=patreon_support&utm_content=landing`

### MailerLite
- `MAILERLITE_API_TOKEN`
- `MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES`
- `MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN`

El grupo EN puede permanecer vacío mientras no exista automatización inglesa aprobada; el grupo ES sí debe estar activo antes de lanzar campañas de captación.

## 2. Orden de activación

1. Confirmar Supabase operativo.
2. Confirmar funciones Edge activas:
   - `collect-lead`
   - `collect-analytics`
3. Confirmar tablas y RLS.
4. Activar MailerLite ES.
5. Probar un registro interno.
6. Confirmar lead en Supabase.
7. Confirmar subscriber en MailerLite.
8. Confirmar email automático recibido.
9. Confirmar `/go/amazon`.
10. Confirmar `/go/patreon`.
11. Confirmar eventos en Analytics.
12. Confirmar `/api/health`.
13. Solo entonces abrir tráfico público.

## 3. Smoke test manual de producción

### Landing
- Abrir `/es`.
- Abrir `/en`.
- Verificar portada.
- Verificar navegación.
- Verificar CTA Amazon.
- Verificar CTA Patreon.

### Registro
Usar un correo interno de prueba.

Esperado:
- Nombre opcional.
- Consentimiento obligatorio.
- Redirect a `/es/gracias`.
- Lead visible en `/admin/leads`.
- MailerLite en estado `synced` cuando esté configurado.

### Capítulo
- Abrir `/es/capitulo-1` desde Gracias.
- Confirmar contenido.
- Confirmar CTA Amazon.
- Confirmar CTA Patreon.

### Test
- Completar 12 preguntas.
- Confirmar perfil.
- Guardar perfil con el mismo correo del registro inicial.
- Confirmar que no aparece un lead duplicado.
- Confirmar perfil en Control Center.

### Tracking
Comprobar:
- page_view
- lead_submit
- test_start
- test_complete
- amazon_click
- patreon_click

## 4. URLs rastreables

### Amazon
`https://www.fragmentun.com/go/amazon?locale=es&utm_source=email&utm_medium=email&utm_campaign=fragmentun_nurture&utm_content=email_01`

### Patreon
`https://www.fragmentun.com/go/patreon?locale=es&utm_source=email&utm_medium=email&utm_campaign=fragmentun_patreon&utm_content=email_01`

## 5. Health

Endpoint:
`/api/health`

Esperado:
- HTTP 200
- `ok: true`
- `supabase: true`

Nunca debe devolver tokens o claves.

## 6. Control Center

Revisar:
- Analytics.
- Leads.
- Marketing.
- Estado del sistema.
- Usuarios.
- Contenido.
- Test.
- Mapa.

## 7. Seguridad

Confirmar:
- Admin no crea usuarios nuevos desde el formulario de login.
- RLS activo.
- Supabase Security Advisor sin alertas.
- `/admin` y `/api` fuera de robots.
- `/capitulo-1` fuera de indexación.
- Headers de seguridad presentes.
- APIs públicas limitan tamaño de payload.
- Registro rechaza orígenes cruzados.

## 8. Rollback

Si una publicación rompe el embudo:
1. Detener campañas pagadas.
2. Volver al último commit verde de `main`.
3. Confirmar `/api/health`.
4. Confirmar formulario.
5. Confirmar redirects.
6. Reactivar tráfico.

Nunca borrar leads durante un rollback.

## 9. Criterio GO / NO-GO

GO solo si:
- CI verde.
- Health verde.
- Lead de prueba guardado.
- Email de prueba recibido.
- Amazon abre correctamente.
- Patreon abre correctamente.
- Analytics recibe eventos.
- Mobile funciona.
- Admin funciona.

NO-GO si cualquiera de estos puntos críticos falla:
- pérdida de leads,
- error de registro,
- health rojo,
- redirects rotos,
- auth administrativa insegura,
- MailerLite no recibe contactos durante campañas activas.


## 10. Redes sociales oficiales

- Instagram oficial: https://www.instagram.com/jfliranzo22/
- YouTube oficial: https://www.youtube.com/@JoseLiranzo-n3v
- Facebook oficial: https://www.facebook.com/profile.php?id=61587405719109

Variables:
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_YOUTUBE_URL`
- `NEXT_PUBLIC_FACEBOOK_URL`

TikTok y X deben permanecer vacíos hasta tener URLs oficiales confirmadas.

Tracking:
- evento `community_click`
- metadata `network`
- metadata `placement`


## Comunidad oficial de Facebook

Estado actual: pendiente.

La landing diferencia entre:
- perfiles sociales públicos,
- comunidad/grupo oficial de Facebook.

Variable reservada:
- `NEXT_PUBLIC_FACEBOOK_COMMUNITY_URL`

Mientras esta variable esté vacía:
- no se muestra CTA de comunidad,
- no se muestra sección de grupo,
- solo aparecen las redes oficiales existentes.

Cuando se cree el grupo:
1. añadir la URL oficial a `NEXT_PUBLIC_FACEBOOK_COMMUNITY_URL`;
2. el CTA “Únete a la comunidad FRAGMENTUN” aparecerá automáticamente;
3. los clics se medirán como `community_click` con `network=facebook_group`.
