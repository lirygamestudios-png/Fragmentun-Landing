# FRAGMENTUN Control Center — Functional Specification v1.0

Ruta principal: /admin

## 1. Dashboard
Funciones:
- Estado del sitio.
- Visitantes.
- Leads.
- Clics a Amazon.
- Tests completados.
- Actividad reciente.
- Accesos rápidos.
- Publicar cambios.

## 2. Contenido Web
Editable:
- Hero
- Secciones
- CTAs
- Menú
- Footer
- SEO
- FAQs
- Visibilidad de módulos

Estados:
- Borrador
- Revisión
- Publicado

## 3. Biblioteca de Medios
- Subida drag & drop.
- Carpetas/tags.
- Filtros por tipo.
- Vista previa.
- Reemplazo de archivo.
- Alt text.
- Uso/referencias del asset.

Regla:
- Marcar portada oficial y retrato oficial como assets protegidos.

## 4. Saga
Por libro:
- Título
- Subtítulo
- Estado
- Fecha
- Portada
- Descripción
- Enlace Amazon
- Formatos
- Capítulos/contenido relacionado

## 5. Personajes
Campos:
- Nombre
- Rol
- Estado
- Biografía corta/larga
- Imagen
- Relaciones
- Frases
- Galería
- Territorio emocional asociado

## 6. Mapa de Lumen
- Crear/editar territorios.
- Crear puntos de interés.
- Iconos.
- Descripciones.
- Coordenadas.
- Eventos narrativos.
- Audio opcional.
- Estado visible/oculto.

Territorios base:
- Vorax
- Umbral
- Ethelis
- Nara

## 7. Test Emocional
- Preguntas.
- Opciones.
- Peso por dimensión.
- Activar/desactivar pregunta.
- Orden drag & drop.
- Perfiles/arquetipos.
- Resultados.
- Recomendaciones.

Nota:
Presentar como experiencia narrativa/emocional, no diagnóstico clínico.

## 8. Comunidad
- Noticias.
- Eventos.
- Enlaces.
- CTA Discord/redes.
- Contenido exclusivo.
- Métricas solo reales.

## 9. Reseñas
- Fuente.
- Autor visible.
- Texto.
- Fecha.
- Estado.
- Link de verificación cuando exista.

Regla:
- No publicar testimonios inventados.
- Moderación previa obligatoria.

## 10. Marketing
- CTA globales.
- Enlaces Amazon.
- UTMs.
- Banners.
- Campañas.
- Popups.
- Lead magnets.
- A/B labels.

## 11. Analytics
KPIs:
- Sesiones.
- Leads.
- CPL.
- Conversion rate.
- Amazon outbound clicks.
- CTR por CTA.
- Test starts/completions.
- Top sources.
- UTM content.
- Device split.

## 12. Usuarios y Roles
Roles:
- Administrador
- Editor
- Marketing

Permisos:
Administrador:
- Todo.

Editor:
- Contenido, medios, personajes, saga, mapa, test.

Marketing:
- Campañas, UTMs, CTA, analítica, reseñas.

## 13. Auditoría
Registrar:
- Usuario
- Acción
- Entidad
- Antes/después
- Fecha
- IP/session id cuando sea legalmente apropiado

## 14. Seguridad
- Login protegido.
- MFA recomendado.
- Sesiones con expiración.
- Rate limiting.
- CSRF.
- Sanitización de contenido.
- Backups.


## 15. Gestión multilingüe ES/EN
Todo contenido público traducible debe tener pestañas o columnas:
- ES
- EN

Campos administrativos por contenido:
- estado_traduccion_es
- estado_traduccion_en
- revisado_por
- fecha_revision

Estados por idioma:
- Pendiente
- Traducido
- Revisado
- Publicado

Funciones:
- Filtrar contenido con traducción pendiente.
- Duplicar estructura ES → EN sin copiarla como traducción final.
- Vista previa por idioma.
- Publicar un idioma sin obligar a publicar el otro cuando la estrategia lo requiera.
- Advertencia antes de publicar si faltan campos críticos.
- SEO por idioma.
- CTA y URL Amazon por idioma.
- Segmento MailerLite por idioma.
- Reseñas localizadas solo cuando exista traducción autorizada.

Dashboard:
- Filtro ES / EN / Todos.
- Métricas segmentadas por locale.
