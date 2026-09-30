# FRAGMENTUN — Responsive & UX Specification v1.0

## Breakpoints
- Mobile S: 320–389
- Mobile: 390–767
- Tablet: 768–1023
- Desktop: 1024–1439
- Wide: 1440+

## Web pública

### Header
Desktop:
- Logo izquierda.
- Navegación central.
- CTA Amazon derecha.

Tablet:
- Menú reducido.
- CTA visible.
- Opciones secundarias dentro de drawer.

Mobile:
- Logo + hamburguesa.
- CTA Amazon visible dentro del drawer.
- Header sticky.

### Hero
Desktop:
- 2 columnas visuales.
- Portada oficial del libro visible.
- Elyon/Lumen como fondo narrativo.
- CTA primario Amazon, CTA secundario capítulo 1.

Tablet:
- 60/40 o stack parcial.
- Portada conserva protagonismo.

Mobile:
- Stack vertical.
- Portada oficial primero.
- Título y CTA después.
- Evitar texto sobre zonas faciales.

### Secciones
Desktop:
- Cards 3–4 columnas.
Tablet:
- 2 columnas.
Mobile:
- 1 columna.
- Carruseles horizontales solo cuando mejoren exploración.

### Mapa de Lumen
Desktop:
- Mapa + panel lateral persistente.
Tablet:
- Mapa arriba + panel inferior.
Mobile:
- Mapa full-width.
- Bottom sheet deslizable.
- Pinch zoom y controles táctiles grandes.

### Test emocional
Desktop:
- Pregunta + visualización lateral.
Mobile:
- Una pregunta por pantalla.
- CTA fijo inferior.
- Progreso siempre visible.

### Capítulo 1 / MailerLite
Mobile:
- Nombre y email apilados.
- CTA full width.
- Mensaje legal legible.

### Saga
Desktop:
- Carrusel 3–4 libros.
Mobile:
- 1 libro principal + snap carousel.

## Panel /admin

### Navegación
Desktop:
- Sidebar fijo.
Tablet:
- Sidebar colapsable.
Mobile:
- Drawer.

### Tablas
Desktop:
- Tabla completa.
Tablet:
- Columnas secundarias ocultables.
Mobile:
- Convertir filas en cards.
- Acciones en menú contextual.

### Biblioteca
Desktop: grid 4–6 columnas.
Tablet: 3 columnas.
Mobile: 2 columnas.

### Dashboard
Desktop: 4 KPI por fila.
Tablet: 2.
Mobile: 1 o 2 compactos.

## Rendimiento responsive
- Hero image: AVIF/WebP con srcset.
- Portada: WebP + fallback JPG/PNG.
- Lazy-load debajo del fold.
- Imágenes de mapa divididas por capas.
- Priorizar LCP del hero.
