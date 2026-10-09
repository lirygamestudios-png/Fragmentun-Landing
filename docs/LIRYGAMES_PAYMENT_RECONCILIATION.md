# Conciliación y entrega virtual — LIRYGAMES

Estado: especificación técnica y validaciones puras, **sin cobros ni entrega real**.

Toda orden estará asociada a jugador autenticado, videojuego, artículo, moneda USD, precio fijado en servidor y procesador. La confirmación se comprobará en backend mediante el mecanismo firmado del proveedor. Los eventos deberán ser idempotentes y correlacionarse con la orden.

## Proceso previsto
1. Registrar orden pendiente y referencia del procesador con unicidad verificable.
2. Validar identidad del proveedor, referencia, estado, importe, moneda, jugador, juego y artículo.
3. Calcular bruto, importe devuelto, comisiones y neto, conservando moneda y trazabilidad.
4. Entregar un artículo solo tras pago confirmado y validación favorable; registrar unicidad por referencia de transacción, destinatario y artículo.
5. Si hay reembolso, reembolso parcial o disputa, abrir revisión de derecho de uso y política comercial. No ejecutar automáticamente una revocación sin reglas específicas y auditoría.
6. Conservar un historial auditable y permitir conciliación contra informes del procesador.

El módulo `lib/payments/reconciliation.ts` implementa validaciones puras; no modifica tablas ni inventarios. La simulación administrativa actual sigue separada, sin persistencia real.
