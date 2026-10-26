# LIRYGAMES — Presupuesto por hitos del primer videojuego (plantilla de decisión)
Fecha: 25/10/2026. ESTADO: diseño preliminar; sin presupuestos cotizados ni compromisos.

## Propósito y límites
- Primer juego: identificador anónimo LGS-G01, sin divulgar nombre, narrativa, personajes ni otros activos protegidos.
- Alcance autorizado para planificar: un vertical slice con tres niveles/mundos, el primero accesible gratuitamente y dos con modalidad comercial todavía sujeta a definición técnica/legal. No afirmar que existe producto final o integración de pagos.
- Respetar la decisión del titular de **revisar posteriormente el orden de las fases**. Este archivo no cambia el orden de ejecución ni aprueba gastos.
- Anterior escenario financiero de dos años es una hipótesis global, NO presupuesto del juego G01. No confundir el rubro de desarrollo de $55.000 del año 1 con una cotización real.

## Alcance mínimo del vertical slice que debe presupuestarse
| Paquete de trabajo | Entregable comprobable | Responsabilidad inicialmente preferida | Puerta de salida |
|---|---|---|---|
| Diseño y alcance | documento mecánica central, criterios tres niveles, economía base y lista de exclusiones | Dirección creativa interna | alcance congelado |
| Prototipo motor | prueba de mecánica jugable y rendimiento/exportación web en motor evaluado | equipo técnico por definir | gameplay probado |
| Dirección de arte | guía visual, UI de HUD, personajes/entornos de prueba sin divulgación pública de IP | dirección interna + proveedor a valorar | assets con derechos claros |
| Programación | lógica de juego, guardado, estados, navegación, ajuste de dificultad | proveedor/equipo por cotizar | tres niveles funcionales |
| Audio/localización | audio básico licenciado y textos ES/EN necesarios | interno + servicios puntuales | sin derechos pendientes |
| QA/accesibilidad | pruebas funcionales web/móvil objetivo, rendimiento, mandos/teclado, subtítulos cuando procedan | pruebas internas + QA puntual | fallos críticos cero |
| Seguridad/datos | límites de telemetría, guardado, prevención de abuso, revisión privacidad | técnico/legal | riesgos documentados |
| Economía y monetización | fichas de IAP, DLC y anuncios futuros por separado, **todo desactivado** | producto interno | sin cobros ni SDK |
| Publicación | requerimientos de tienda, contenido legal, derechos, rating si aplica | interno + asesoría | lanzamiento solo autorizado |

## Clasificación para controlar el capital
**A. Trabajo interno posible** (sin contratar por defecto): dirección editorial, definición de mecánicas, documentación, validación de IP, análisis de economía, criterios UX y pruebas exploratorias.
**B. Contratación potencial a cotizar, NO aprobada:** ingeniería de motor y optimización, animación/modelado especializado, efectos/audio original, auditoría QA y accesibilidad, asesoría legal especializada.
**C. Diferible hasta disponer de evidencias:** integración real de pagos, publicidad, torneos remunerados, matchmaking online persistente, IA de soporte, traducciones extensas ajenas al vertical slice, DLC premium, pases de temporada y personal permanente.
No declarar una tarea «sin costo» si consume tiempo remunerado de fundadores o colaboradores; usar costo económico y desembolso de caja por separado.

## Matriz de compras y presupuesto (completar con cotizaciones reales)
Cada paquete debe registrar: alcance exacto, responsable, tarifa horaria/fija, horas, costo presupuestado, moneda, derechos de IP, hitos de entrega, criterios de aceptación, dependencias, riesgos y salida contractual.
- Diseño: TBD
- Ingeniería: TBD
- Arte y animación: TBD
- Música/sonido: TBD
- QA/accesibilidad: TBD
- Legal y distribución: TBD
- Infraestructura recurrente: TBD
- Contingencia: calcular después de estimaciones documentadas; NO añadir porcentajes arbitrarios a cifras aún desconocidas.

## Puertas de inversión
**G0:** validación FrontDesk; no se reactiva Commander Center.
**G1:** inventario de materiales existentes y análisis de reutilización legal/técnica, bajo custodia privada.
**G2:** prueba pequeña sin servicios costosos de compatibilidad motor/web y mecánica.
**G3:** presupuesto de proveedores comparables, derechos y calendario por hitos, sin contratar aún.
**G4:** aprobación expresa de alcance, presupuesto tope, contratos y despliegues/costos.
**G5:** entrega de vertical slice probado y comparativa costo real vs aprobado.
**G6:** decisión posterior sobre monetización, plataforma de publicación y escalado.
Estas puertas son dependencias de riesgo, no un cambio unilateral a las fases del plan comercial.

## Riesgos financieros y medición
- Modelar consumo de caja mensual según desembolsos, no usando solo el promedio anual.
- Preparar escenarios de sobrecosto 20%-30%, retraso de seis meses y cero ingresos antes del lanzamiento comercial.
- Medir costo total del vertical slice, horas de desarrollo, fallos severos, tasa de finalización, compatibilidad web y costo posterior por nivel.
- Mantener separados GMV de terceros, ingresos netos retenidos, impuestos, devoluciones, marketing y margen operativo.
- Conservar control societario del titular y derechos de IP en contratos: ninguna cesión por defecto.

**Restricciones:** no activar anuncios, cuentas, servicios, pago, servidores u otras suscripciones con costo sin autorización. No tocar FRAGMENTUN, `main` ni producción. No publicar IP privadas en este repositorio.

## Inventario verificado en GitHub

**Revisión del árbol completo de la rama autorizada, 25/10/2026, commit base 9119f317.** El árbol de GitHub no estaba truncado.

| Material observado | Resultado real | Reutilización recomendada | Límite |
|---|---|---|---|
| `public/liry-assets/world-01.webp` a `world-09.webp` | nueve imágenes existentes | presentación de catálogo/marketing | no demuestra arte jugable ni licencias de uso externo |
| `components/LiryGameDiscovery.tsx` | catálogo y visualización pública | UX y patrones de navegación | no es código de mecánica jugable |
| `lib/games/liry-global-journey.ts`, `gamer-xp.ts` | módulos de plataforma existentes | estudiar contratos de progresión/experiencia | no asumir compatibilidad directa con motor |
| `lib/games/liry-public-dna-projection.ts` | proyección de afinidad en plataforma | recomendación y perfil de gamer | no aporta niveles jugables |
| `components/LiryStoreCategories.tsx` y contratos commerce | interfaz/contratos de tienda | diseño de monetización futura | no habilitar pagos ni suponer checkout operativo |
| Componentes de perfil, autenticación y comunidad | componentes de plataforma existentes | patrón de integración futura | deben pasar revisión de seguridad y privacidad |
| Archivos nativos `.godot`, `.unity`, `.uproject`, `.blend`, `.fbx`, `.glb`, `.gltf`, `.wav`, `.mp3`, `.ogg`, `.psd` en el árbol | ninguno identificado | ninguno verificado | esto no prueba inexistencia en archivos privados u otras fuentes |

**Conclusión:** se han identificado principalmente activos de promoción y arquitectura de plataforma. **No existe evidencia en este repositorio de que ya dispongamos de los tres niveles jugables, assets de producción, proyecto de motor o licencias de audio/arte del primer videojuego.**

**Próxima puerta G1:** revisar el consolidado creativo PRIVADO del titular y cada activo de LGS-G01, sin publicarlo: inventario de diseño/narrativa, prototipos/archivos de motor, modelos, animación, UI/HUD, sonidos, derechos/licencias, formatos, autor/responsable, madurez (concepto/prototipo/producción) y esfuerzo de adaptación. Clasificar reutilizable sin cambios / adaptable / requiere creación / no comprobado. Solo después solicitar cotizaciones y ajustar presupuesto. El orden de fases sigue provisional.
