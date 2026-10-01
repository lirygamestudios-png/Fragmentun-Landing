# FRAGMENTUN — Implementation Plan v2.0

## Stack
Frontend: Next.js + TypeScript + App Router  
Hosting: Vercel  
Repositorio: GitHub  
Base de datos / CMS / Analytics: Supabase  
Email: MailerLite  
Compra: Amazon  
Patrocinio: Patreon

Amazon oficial: https://www.amazon.com/dp/B0HBLTHT8S  
Patreon oficial: https://patreon.com/sagaFragmentun

## Estado ejecutivo

### Fase 1 — Design System
Estado: **IMPLEMENTADO**
- Tokens visuales navy / gold / blue.
- Botones primary / secondary / ghost / Patreon.
- Cards, formularios, paneles y responsive.
- Motion con respeto a `prefers-reduced-motion`.
- Focus visible para teclado.

### Fase 2 — Web pública
Estado: **IMPLEMENTADA**
- Header bilingüe.
- Hero.
- Portada oficial Libro I.
- Historia / propuesta.
- Lumen.
- Capítulo 1.
- Saga.
- Test Emocional.
- Mapa de Lumen.
- Autor.
- Reseñas verificadas.
- CTA Amazon.
- CTA Patreon.
- Footer.

Pendiente editorial:
- Retrato oficial del autor en la sección pública, si se decide mostrarlo.
- Muestra inglesa final cuando exista edición/muestra aprobada en inglés.

### Fase 3 — Conversión
Estado: **IMPLEMENTADA EN CÓDIGO / MAILERLITE PENDIENTE DE CREDENCIALES**
- Captura de email.
- Nombre opcional.
- Consentimiento explícito.
- Honeypot anti-spam.
- Página de gracias.
- Entrega inmediata del Capítulo 1.
- Secuencia de 5 correos documentada.
- UTM persistente durante la sesión.
- Presets UTM.
- Eventos analytics.
- Clics Amazon.
- Clics Patreon.
- Redirect rastreable `/go/amazon`.
- Leads conservados aunque MailerLite falle.
- Reintento manual de MailerLite desde Control Center.

Pendiente:
- Activar token y grupos ES/EN reales de MailerLite.
- Crear automatización dentro de MailerLite con la secuencia documentada.
- Prueba real de entrega y unsubscribe.

### Fase 4 — Experiencias
Estado: **IMPLEMENTADA**
- Test Emocional de 12 preguntas.
- Perfiles Vorax / Umbral / Ethelis / Nara / Balance.
- Captura opcional de perfil emocional junto al lead.
- Segmentación por perfil en Control Center.
- Distribución de perfiles en Analytics.
- Mapa interactivo de Lumen.

### Fase 5 — Control Center
Estado: **IMPLEMENTADO**
- Auth.
- Roles admin / editor / marketing.
- CMS bilingüe.
- Saga / ediciones.
- Personajes.
- Mapa.
- Test.
- Reseñas.
- Marketing / UTMs.
- Analytics.
- Leads.
- Exportación CSV.
- Estado de MailerLite.
- Gestión de usuarios internos.
- Auditoría administrativa.
- Historial de integraciones.
- Estado del sistema.
- Backup administrativo sin leads ni secretos.
- Eliminación de leads por solicitud de privacidad.
- Forget GDPR de MailerLite cuando aplica.

### Fase 6 — QA
Estado: **IMPLEMENTADA EN CÓDIGO / VALIDACIÓN EN PRODUCCIÓN PENDIENTE**
Completado:
- Builds CI en GitHub.
- Errores visibles en formulario.
- Confirmación de registro solo tras persistir lead.
- Middleware corregido para redirects rastreables.
- Dedupe de leads por email.
- Conservación de datos buenos en registros repetidos.
- Accesibilidad de inputs.
- Focus visible.
- Portada con dimensiones explícitas.
- SEO internacional.
- Canonical / hreflang / x-default.
- Open Graph / Twitter.
- Structured Data Book / Person / WebSite.
- Sitemap.
- Robots.
- Supabase Security Advisor: 0 avisos.
- Dependencias críticas fijadas en lockfile con overrides de seguridad.
- Health endpoint.
- Smoke tests automáticos del funnel.
- Headers HTTP de seguridad.
- Endurecimiento de APIs públicas.
- Persistencia UTM cross-page.
- Experimento A/B del CTA de Capítulo 1.
- Dashboard de experimentos A/B.
- Manejo de errores 404/global.
- Smoke test de 404.
- Observabilidad de integraciones.

Pendiente QA:
- Prueba end-to-end en entorno desplegado.
- Lighthouse real.
- Pruebas móvil / tablet / desktop en navegador real.
- Prueba de formularios con MailerLite activo.
- Prueba de clics Amazon / Patreon en producción.

### Fase 7 — Producción
Estado: **PAUSADA HASTA VOLVER A VERCEL / INTEGRACIONES EXTERNAS**
- Vercel: pendiente por decisión del proyecto.
- Aprovisionar primer usuario Auth/admin_profile.
- MailerLite: token + grupos + automatización ES/EN.
- Variables de entorno de producción.
- Dominio.
- DNS.
- SSL.
- Monitoring.
- Backup/exportación JSON del CMS y configuración pública: IMPLEMENTADO.
- Smoke test post-deploy.

## Criterios de aceptación
- Portada oficial en toda representación del Libro I.
- No métricas públicas ficticias.
- No reseñas inventadas.
- CTA Amazon rastreable.
- CTA Patreon rastreable.
- Captura de email persistente.
- Consentimiento auditable.
- Leads sin duplicados.
- Mobile-first funcional.
- Analytics por fuente, idioma y objetivo.
- SEO internacional.
- Seguridad Supabase sin avisos críticos.
- Build CI verde.
- Lighthouse objetivo: 90+ en Performance / Accessibility / SEO cuando sea razonable.

## Internacionalización
Locales iniciales:
- ES
- EN

Rutas:
- `/es/...`
- `/en/...`

Implementado:
- Locale explícito en ruta.
- Contenido CMS ES/EN.
- Metadata por idioma.
- hreflang.
- Analytics con locale.
- Leads con locale.
- MailerLite preparado para grupos ES/EN.
- URLs Amazon configurables por edición.

Pendiente:
- Contenido editorial inglés completo donde aún no exista una edición aprobada.


## Estado previo a volver a Vercel

### Terminado
- CI verde sobre la base funcional principal.
- Supabase Security Advisor: 0 alertas.
- Edge Functions activas.
- Captación y analytics preparados.
- Amazon y Patreon rastreables.
- Redes sociales oficiales con tracking.
- Comunidad Facebook preparada pero oculta hasta disponer de URL oficial.
- Health endpoint.
- Smoke tests.
- A/B testing.
- Runbook de producción.
- Guía MailerLite.
- Guía de primer acceso admin.

### Requiere acción externa / credencial
- MailerLite API token.
- IDs de grupos MailerLite ES/EN.
- Configuración de automatizaciones en MailerLite.
- Primer usuario Supabase Auth + admin_profile.
- Despliegue Vercel.
- Dominio/DNS/SSL.
- Lighthouse y pruebas de navegador sobre entorno real.
