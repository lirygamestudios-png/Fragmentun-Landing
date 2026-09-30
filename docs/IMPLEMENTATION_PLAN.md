# FRAGMENTUN — Implementation Plan v1.0

## Arquitectura recomendada
Frontend:
- Next.js
- TypeScript
- App Router
- Server Components donde convenga

Hosting:
- Vercel

Repositorio:
- GitHub

Contenido:
- CMS / base de datos con panel /admin

Email:
- MailerLite

Compra:
- Amazon
- URL oficial: https://www.amazon.com/dp/B0HBLTHT8S

## Estructura sugerida
/app
  /(public)
    page.tsx
    universo/
    personajes/
    saga/
    test/
    mapa/
    autor/
    comunidad/
  /admin
    page.tsx
    contenido/
    medios/
    saga/
    personajes/
    mapa/
    test/
    marketing/
    analytics/
    usuarios/
/components
/lib
/public
/styles
/docs

## Fases

### Fase 1 — Design System
Estado: APROBADO conceptualmente.
Salida:
- tokens
- componentes
- responsive
- motion

### Fase 2 — Web pública
- Header
- Hero
- Libro
- Autor
- Por qué FRAGMENTUN
- Lumen
- Capítulo 1
- Saga
- Test teaser
- Mapa teaser
- Comunidad
- Reseñas
- CTA final
- Footer

### Fase 3 — Conversión
- MailerLite
- página gracias
- entrega capítulo
- UTMs
- eventos analytics
- clics Amazon

### Fase 4 — Experiencias
- Test emocional
- Mapa interactivo

### Fase 5 — Control Center
- auth
- roles
- CMS
- media
- edición
- publicación

### Fase 6 — QA
- responsive
- accesibilidad
- performance
- SEO
- tracking
- formularios
- seguridad

### Fase 7 — Producción
- dominio
- DNS
- SSL
- monitoring
- backup

## Criterios de aceptación
- Portada oficial en toda representación del Libro I.
- Retrato oficial del autor en toda representación pública.
- No datos ficticios en métricas públicas.
- No reseñas inventadas.
- CTA Amazon rastreable.
- Captura de email funcional.
- Mobile first funcional.
- Lighthouse objetivo: 90+ en Performance/Accessibility/SEO cuando sea razonable.


## Internacionalización ES/EN — decisión arquitectónica
La internacionalización se implementa antes de construir los componentes finales.

### Rutas
- /es/...
- /en/...

### Requisitos técnicos
- Locale como parte explícita de la ruta.
- Diccionarios/UI separados del contenido editorial.
- CMS con campos localizados ES/EN.
- Metadata y hreflang por idioma.
- Persistencia de preferencia del usuario.
- Eventos analytics incluyen locale.
- MailerLite recibe locale.
- URLs Amazon configurables por locale.

### Estructura sugerida actualizada
/app
  /[locale]
    page.tsx
    universo/
    personajes/
    saga/
    test/
    mapa/
    autor/
    comunidad/
  /admin
    ...
/messages
  es.json
  en.json

Locales soportados iniciales:
- es
- en

### QA adicional
- Navegación ES/EN.
- Fallbacks.
- SEO internacional.
- Emails por idioma.
- Longitud de copy.
- Formularios preservan locale.
