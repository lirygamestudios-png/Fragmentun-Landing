# FRAGMENTUN — Convención UTM v1.0

## Objetivo
Mantener nombres consistentes para que Analytics agrupe correctamente visitas, leads, clics Amazon y clics Patreon.

## Campos
- `utm_source`: plataforma o fuente.
- `utm_medium`: tipo de tráfico.
- `utm_campaign`: campaña principal.
- `utm_content`: pieza o variante concreta.

## Fuentes estándar
- `instagram`
- `meta`
- `tiktok`
- `youtube`
- `email`
- `patreon`
- `direct`

## Medios estándar
- `organic_social`
- `paid_social`
- `organic_video`
- `paid_video`
- `email`
- `creator_referral`

## Campañas recomendadas
- `fragmentun_cap1`: captación para lectura del Capítulo 1.
- `fragmentun_nurture`: secuencia de seguimiento por email.
- `fragmentun_amazon`: campañas orientadas a compra.
- `fragmentun_patreon`: campañas orientadas a patrocinio.
- `fragmentun_test`: campañas orientadas al Test Emocional.

## Contenido
Usar identificadores breves y secuenciales:
- `post_01`
- `video_01`
- `ad_01`
- `carousel_01`
- `email_01`

## Ejemplos

Instagram orgánico:
`?utm_source=instagram&utm_medium=organic_social&utm_campaign=fragmentun_cap1&utm_content=post_01`

Meta Ads:
`?utm_source=meta&utm_medium=paid_social&utm_campaign=fragmentun_cap1&utm_content=ad_01`

TikTok:
`?utm_source=tiktok&utm_medium=organic_social&utm_campaign=fragmentun_cap1&utm_content=video_01`

YouTube:
`?utm_source=youtube&utm_medium=organic_video&utm_campaign=fragmentun_cap1&utm_content=video_01`

Email:
`?utm_source=email&utm_medium=email&utm_campaign=fragmentun_nurture&utm_content=email_01`

## Regla
No cambiar mayúsculas/minúsculas ni crear sinónimos como `ig`, `instagram_social`, `fb`, `facebook_ads` si ya existe una fuente estándar. Esto evita dividir artificialmente el mismo canal en varias filas del dashboard.
