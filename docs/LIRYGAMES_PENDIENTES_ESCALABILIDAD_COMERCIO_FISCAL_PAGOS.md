# LIRYGAMES STUDIOS — Pendientes de escalabilidad comercial
Estado: PENDIENTE. Incorporado al plan de desarrollo; sin activación ni cambios en producción.

## Prioridad P1 — Antes del primer vertical slice monetizado
- Catálogo de bienes digitales freemium: skins, habilidades, consumibles, monedas y packs; SKU por videojuego; versiones y disponibilidad.
- Inventario y titularidad segura de compras por usuario; entrega después de confirmar pago en servidor, mecanismos anti-duplicación, idempotencia y reembolsos/revocaciones.
- Integración real con al menos un proveedor de pagos apto para el modelo y territorios iniciales; webhooks verificados, reintentos, devoluciones y conciliación.
- Estrategia fiscal del lanzamiento: identificar vendedor legal/merchant of record, países iniciales, tratamiento de impuestos de bienes digitales y obligaciones de registro con asesoría profesional.
- Pruebas integrales con pago exitoso, fallido, duplicado, cancelado y reembolsado; protección de credenciales, antifraude y RLS.

## Prioridad P2 — Expansión del catálogo y operación
- Administración de múltiples videojuegos, DLC, suscripciones, bundles y productos físicos/digitales sin rediseñar el núcleo.
- Arquitectura interoperable de proveedores: Stripe/PayPal u otras pasarelas según mercado y modelo de cumplimiento.
- Pedidos multimoneda, precios por país, historial de tasas de cambio y conciliación de comisiones.
- Facturación, devoluciones, disputas, contracargos y reportes financieros consolidados.
- Roles, auditoría, métricas por producto y permisos financieros diferenciados.

## Prioridad P3 — Internacionalización fiscal y escalamiento
- Integración con motor especializado de impuestos indirectos (IVA/VAT/GST/sales tax), por jurisdicción, umbrales y tipo de producto.
- Configuración por establecimiento, entidad legal y país; evidencia de ubicación y reglas aplicables, protección de datos y conservación documental.
- Reportes y conciliación contable multi-entidad, multi-divisa, liquidaciones y declaraciones mediante asesores/proveedores especializados.
- Evaluación de merchant of record frente a venta directa según costes, exposición fiscal y control operativo.
- Pruebas de carga, observabilidad de pagos, tolerancia a fallos, disponibilidad y recuperación.

## Principios aprobados
- Desarrollo modular, sin rehacer FrontDesk ni Commander Center.
- La plataforma es freemium y la monetización principal prevista está dentro de los videojuegos.
- No dar por implementados cobros, impuestos automáticos o inventarios digitales por existir únicamente tablas o configuración.
- No conectar medios de pago reales ni activar ventas sin pruebas y aprobaciones de seguridad, legales y financieras.
- Continuar trabajando en la rama work/master-admin-implementation y mantener las pautas visuales aprobadas.
