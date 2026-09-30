# FRAGMENTUN — Internationalization Specification ES/EN v1.0

## Objetivo
FRAGMENTUN nace bilingüe desde arquitectura, diseño, contenido, SEO, conversión y administración.

Idiomas iniciales:
- Español: es
- English: en

Idioma por defecto:
- Español (es)

## 1. Estructura de URLs
Público:
- /es
- /en

Ejemplos:
- /es/universo
- /en/universe
- /es/personajes
- /en/characters
- /es/saga
- /en/saga
- /es/test
- /en/test
- /es/mapa
- /en/map
- /es/autor
- /en/author
- /es/comunidad
- /en/community

Admin:
- /admin
El panel puede tener UI en español inicialmente, pero todo contenido público editable tendrá campos ES y EN.

## 2. Detección de idioma
Primera visita:
1. Respetar idioma previamente elegido y guardado.
2. Si no existe preferencia, usar Accept-Language del navegador como sugerencia.
3. No redirigir de forma agresiva si el usuario entra a una URL explícita /es o /en.

Selector:
- Visible en header desktop.
- Visible en drawer mobile.
- Formato: ES | EN.
- Cambiar idioma debe conservar la sección equivalente cuando exista.

## 3. Modelo de contenido
Cada entidad traducible debe soportar:
- value_es
- value_en
- translation_status
- last_reviewed_at
- reviewed_by

Estados:
- pendiente
- traducido
- revisado
- publicado

Fallback:
- Nunca mostrar una traducción automática no revisada como definitiva.
- Si falta EN, el CMS debe advertirlo.
- En producción, definir por sección si se oculta contenido incompleto o usa fallback ES.

## 4. Contenido traducible
- Navegación.
- Hero.
- CTAs.
- Secciones editoriales.
- Saga.
- Personajes.
- Mapa de Lumen.
- Test emocional.
- FAQs.
- Comunidad.
- Reseñas cuando exista permiso/versión traducida.
- SEO.
- Formularios.
- Mensajes de error/éxito.
- Páginas legales.
- Correos y secuencias.

## 5. Activos no traducibles
- Portada oficial publicada: usar el asset oficial correspondiente al mercado/edición.
- Retrato oficial del autor.
- Logos.
- Arte visual aprobado.

Si existe edición oficial en inglés con portada distinta:
- ES usa portada oficial española.
- EN usa portada oficial inglesa.
- Nunca generar una portada sustituta con IA.

## 6. SEO internacional
Por cada página:
- title ES/EN.
- meta description ES/EN.
- canonical por idioma.
- hreflang es.
- hreflang en.
- x-default cuando corresponda.
- Open Graph por idioma.
- Twitter/X metadata por idioma.
- sitemap con alternates.

No traducir slugs de forma inconsistente después del lanzamiento sin redirects 301.

## 7. MailerLite
Cada lead debe guardar:
- locale: es | en
- source
- medium
- campaign
- content
- landing_path

Segmentos/grupos recomendados:
- FRAGMENTUN – Capítulo 1 – ES
- FRAGMENTUN – Chapter 1 – EN
- FRAGMENTUN – Alta intención – ES
- FRAGMENTUN – High Intent – EN
- FRAGMENTUN – Compradores – ES
- FRAGMENTUN – Buyers – EN

Automations:
- Secuencia ES para leads ES.
- Secuencia EN para leads EN.
- Nunca mezclar idiomas en una misma secuencia salvo preferencia explícita.

## 8. Amazon
Configurar enlaces por idioma/mercado:
- ES: URL oficial de la edición española.
- EN: URL oficial de la edición inglesa cuando esté publicada.

Mientras no exista edición inglesa publicada:
- El sitio EN puede explicar claramente la disponibilidad real.
- No simular disponibilidad.

## 9. Test emocional
- Mismo modelo de scoring en ambos idiomas.
- Preguntas adaptadas culturalmente, no traducción literal ciega.
- Misma clave interna por pregunta y opción.
- Resultados con copy ES/EN separado.
- Validar que la longitud EN no rompa UI.

## 10. Mapa de Lumen
Datos internos estables:
- territory_id
- landmark_id
- event_id

Campos localizados:
- name_es/name_en
- description_es/description_en
- tooltip_es/tooltip_en
- event_copy_es/event_copy_en

Audio:
- Puede ser universal o localizado.
- Etiquetas accesibles siempre localizadas.

## 11. Analytics
Registrar locale en todos los eventos relevantes:
- page_view
- lead_submit
- chapter_click
- amazon_click
- test_start
- test_complete
- map_interaction
- community_click

Dashboard debe permitir comparar ES vs EN sin convertirlo en ranking editorial.

## 12. QA bilingüe
Antes de publicar:
- Revisión humana ES.
- Revisión humana EN.
- No overflow.
- No truncado en botones.
- Navegación conserva idioma.
- Formularios mantienen locale.
- Emails llegan en idioma correcto.
- hreflang correcto.
- Links Amazon correctos.
- Test consistente.
- Mapa consistente.
