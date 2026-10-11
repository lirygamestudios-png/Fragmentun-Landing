# LIRYGAMES STUDIOS — Tienda: cierre preparatorio y activación futura

Fecha: 2026-10-11. Rama: `work/master-admin-implementation`.
Estado: **inactivo**. No existen cobros, pedidos, entregas ni reembolsos reales.

## Modelos previstos
1. **Redirección a proveedor externo:** el comprador realiza la transacción en la plataforma del proveedor; el FrontDesk no deberá indicar que LIRYGAMES ha cobrado ni confirmado la entrega.
2. **Venta directa:** facturación por LIRYGAMES y posterior gestión del proveedor; requiere pasarela, conciliación, facturación fiscal, política de devoluciones, contratos y cumplimiento de privacidad.
3. **Compras freemium dentro de los juegos:** principal prioridad comercial del ecosistema; requiere videojuegos activos, cuentas vinculadas, pasarela autorizada, registro persistente de derechos digitales y verificación de entrega por servidor.

## Checklist obligatorio — pendiente
- [ ] Aprobar catálogo, autoría y licencias, precios finales, moneda e impuestos según mercado.
- [ ] Verificar identidad del proveedor y acuerdos de suministro, disponibilidad, devoluciones y atención al cliente.
- [ ] Publicar términos de compra, política de reembolsos, privacidad y tratamiento fiscal pertinentes.
- [ ] Implementar pasarela de pago con verificación de eventos de servidor y firma de webhook.
- [ ] Implementar clave única persistente por pago y pedido, con protección de reintentos concurrentes.
- [ ] Guardar operaciones de pago y asignaciones de artículos digitales con auditoría verificable.
- [ ] Garantizar que un pago verificado entregue un artículo autorizado una sola vez.
- [ ] Manejar interrupciones: conciliación de pago desconocido, entrega desconocida, devolución y contracargo.
- [ ] Probar controles de abuso, fraude, autorización de cuentas y revocación de derechos digitales.
- [ ] Revisar normativa de consumidores, privacidad, protección de menores y condiciones de plataformas de juegos según la jurisdicción.
- [ ] Ejecutar pruebas integrales de pagos, reembolsos y entrega en sandbox antes de habilitar producción.
- [ ] Validar diseño móvil/escritorio y accesibilidad sin alterar la estética aprobada.

## Límites de la auditoría actual
Se probaron contratos de formato y modelos **sin efectos** sobre catálogo, precios, rutas de pago, cotizaciones, duplicados, transición de estados, recuperación, reembolsos y entrega. Esto no equivale a pasar transacciones reales ni certificación legal o PCI. No integrar llaves de pago ni habilitar pedidos en esta fase.

## Restricciones
Mantener nombres internos de las nueve IP confidenciales, no mostrar productos o ingresos ficticios. Mantener separadas la autenticación administrativa y la pública. Commander Center sigue en pausa. Conservar las subpantallas y diseño navy/cyan aprobados.
