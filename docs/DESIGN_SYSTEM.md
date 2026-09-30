# FRAGMENTUN — Design System v1.0

## 1. Dirección visual
Master Design aprobado: Opción 1.

Principios:
- Profesional pero cálido.
- Tecnológico pero humano.
- Cinematográfico sin sacrificar legibilidad.
- Complejo en universo, simple en navegación.
- Cada elemento visual debe apoyar conversión, inmersión o comprensión.

Regla editorial crítica:
- Toda aparición del libro FRAGMENTUN I debe usar la portada oficial publicada.
- Retrato del autor: solo fotografía oficial aprobada.
- Elyon y Lumen deben mantener coherencia visual entre piezas.

## 2. Paleta
- Navy profundo: #0A1628
- Dorado emocional: #C9A84C
- Azul Lumen: #4A90D9
- Púrpura sombra: #6A4EC7
- Fondo profundo: #050A12
- Texto primario: #E2E8F0
- Texto secundario: #94A3B8
- Éxito: #22C55E
- Advertencia: #F59E0B
- Error: #EF4444

Uso:
- Dorado = acción primaria, lujo, énfasis.
- Azul = interacción, tecnología, navegación secundaria.
- Púrpura = test emocional, misterio, contenido inmersivo.
- Rojo/verde/azul/púrpura por territorio emocional cuando corresponda.

## 3. Tipografía
Títulos: Cinzel
Cuerpo/UI: Inter

Escala desktop:
- Display XL: 64–72 px / 0.95
- H1: 48–56 px
- H2: 36–42 px
- H3: 26–30 px
- Body L: 18–20 px
- Body: 16 px
- Small: 13–14 px
- Label: 12–13 px uppercase con tracking amplio

Tablet:
- H1: 42–48 px
- H2: 32–36 px

Mobile:
- H1: 34–40 px
- H2: 28–32 px
- Body: 16 px mínimo

## 4. Grid
Desktop:
- Max width: 1440 px
- Content width: 1200–1280 px
- 12 columnas
- Gutter: 24 px

Tablet:
- 8 columnas
- Gutter: 20 px

Mobile:
- 4 columnas
- Gutter: 16 px
- Márgenes laterales: 16–20 px

## 5. Espaciado
Base 4 px.
Escala: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.

## 6. Radios y sombras
- Botones: 999 px o 12 px según contexto.
- Cards: 18–24 px.
- Inputs: 12 px.
- Modal: 24 px.
- Sombra base: 0 20px 60px rgba(0,0,0,.35)
- Glow dorado CTA: 0 0 30px rgba(201,168,76,.28)

## 7. Botones
### Primario
Fondo: gradiente dorado.
Texto: #111827.
Uso: Comprar, Publicar, Guardar, CTA principal.

### Secundario
Fondo: azul Lumen.
Texto blanco.
Uso: Leer capítulo, abrir test.

### Terciario
Transparente con borde.
Uso: Explorar, volver, acciones no críticas.

Estados:
- default
- hover
- pressed
- focus-visible
- disabled
- loading

## 8. Componentes
- Header
- Mega-nav / mobile drawer
- Hero
- Book mockup card
- Character card
- World card
- Territory card
- Test card
- Review card
- KPI card
- Media card
- Admin table
- Tabs
- Accordion
- Form field
- Modal
- Toast
- Upload zone
- Pagination
- Empty state
- Skeleton loader
- Status badge
- CTA band
- Footer

## 9. Iconografía
Estilo lineal premium, 1.75–2 px.
Nunca mezclar familias visuales.
Iconos clave: historia, personajes, mapa, test, comunidad, libro, Amazon, analítica, medios, usuarios, configuración.

## 10. Fotografía e imagen
- Hiperrealismo cinematográfico.
- Alto rango dinámico.
- Contraste navy/dorado.
- Profundidad atmosférica.
- Evitar saturación excesiva.
- Textos siempre legibles sobre overlays controlados.

## 11. Motion
Duraciones:
- Microinteracción: 160–220 ms
- Hover card: 220–300 ms
- Reveal scroll: 350–500 ms
- Cambio de panel: 250–350 ms
- Modal: 250 ms

Curva sugerida:
cubic-bezier(.2,.8,.2,1)

Reglas:
- Parallax leve, nunca mareante.
- Respetar prefers-reduced-motion.
- Partículas decorativas con límite de CPU/GPU.
- No bloquear acciones por animación.

## 12. Accesibilidad
- WCAG AA mínimo.
- Contraste suficiente.
- Focus visible.
- Navegación por teclado.
- Labels reales en formularios.
- Alt text en imágenes.
- Audio del mapa desactivado por defecto.


## 13. Sistema bilingüe ES/EN
FRAGMENTUN se diseña desde el inicio para español e inglés.

Reglas UI:
- Selector persistente: ES | EN.
- Ningún componente puede depender de una longitud fija de texto.
- Botones deben tolerar expansión de copy de al menos 35%.
- Cards deben usar alturas flexibles cuando sea posible.
- Evitar texto incrustado dentro de imágenes cuando deba traducirse.
- Títulos cinematográficos pueden tener saltos de línea controlados por locale.
- Formularios, errores, vacíos, tooltips y microcopy son localizables.

Reglas tipográficas:
- Mantener Cinzel + Inter en ambos idiomas.
- Verificar kerning y saltos de línea por locale.
- No reducir tipografía por debajo de mínimos de accesibilidad para compensar traducciones largas.

Assets:
- Portada oficial por edición/idioma cuando exista.
- Nunca traducir o regenerar visualmente una portada oficial publicada.
