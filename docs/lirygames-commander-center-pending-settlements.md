# LIRYGAMES STUDIOS — Pendientes Commander Center

## Módulo pendiente: Liquidaciones y pagos automáticos a proveedores

**Estado:** pendiente de desarrollo; no implementar ni activar antes del cierre y validación del FrontDesk.  
**Prioridad:** arquitectura y diseño en la fase Commander Center; ejecución financiera solo después de aprobaciones, cumplimiento y pruebas.  
**Costos actuales autorizados:** ninguno.

### Alcance futuro
1. Registro y validación de proveedores y desarrolladores terceros, datos fiscales aplicables, contrato y condiciones de reparto.
2. Diferenciar ingresos propios de LIRYGAMES (incluidas skins, armas y herramientas propias) de ingresos compartidos con terceros.
3. Libro mayor de operaciones elegibles: venta confirmada, comisión de plataforma y procesamiento, impuestos y retenciones aplicables, descuentos contractuales, reservas, reembolsos, contracargos y ajustes.
4. Motor de liquidación automática por proveedor, contrato, videojuego o canal; corte periódico configurable y trazabilidad por transacción.
5. Estados separados **calculado → revisado/aprobado → programado → enviado → confirmado/conciliado**; errores y reversos.
6. Integración futura, sujeta a selección y elegibilidad, con proveedor autorizado de transferencias (p. ej. Stripe Connect o PayPal Payouts), sin credenciales ni movimientos durante la fase de preparación.
7. Políticas configurables de autoaprobación, límites monetarios, saldos mínimos, doble autorización para excepciones, bloqueos por disputas y suspensiones.
8. Prevención de transferencias duplicadas mediante claves de idempotencia; verificación server-side de eventos, permisos y cuentas de destino; secretos nunca expuestos al FrontDesk.
9. Conciliación con pagos realmente confirmados por el proveedor financiero; manejo de transferencias fallidas y reintentos seguros.
10. Panel del Commander Center con cuentas por pagar, pagos pendientes, saldos, vencimientos, proyecciones, historial y filtros por proveedor/juego/canal.
11. Comprobantes, exportaciones de auditoría y reportes contables/fiscales; registro inmutable de quién aprobó o modificó cada operación.
12. Modo de simulación y pruebas con datos identificados como prueba, sin transferir dinero, antes de habilitar producción.

### Dependencias para puesta en marcha
- Primer videojuego e inventario comercial real; Liry ID y verificación de compras en servidor.
- Contratos de proveedores, políticas de devoluciones y reparto aprobadas.
- Procesador de cobros y servicio de payouts autorizados para la entidad y jurisdicciones pertinentes.
- Revisión contable, tributaria, legal y de seguridad; pruebas de conciliación y doble pago.
- Autorización explícita del propietario antes de habilitar transferencias.

**Regla de continuidad:** este registro NO modifica la prioridad de finalizar el FrontDesk, NO habilita pagos y NO genera nuevos servicios de costo.
