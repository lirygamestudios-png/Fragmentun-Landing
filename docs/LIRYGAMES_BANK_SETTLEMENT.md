# Conciliación bancaria — diseño pendiente de conexión
Estado: funciones puras implementadas, sin credenciales ni integración bancaria o de pasarelas.

Cada lote de liquidación se identifica por proveedor y referencia única. Comprobar:
- Informe verificado del procesador (bruto, comisiones, reembolsos, ajustes).
- Referencia y acreditación del depósito bancario.
- Moneda consistente y diferencias exactas en centavos.
- Duplicaciones de referencia del lote y auditoría.
- Ajustes negativos solo con documentación justificativa.

Fórmula: depósito esperado = bruto - comisiones - reembolsos + ajustes.
El resultado reconciliado requiere coincidencia exacta y verificación de ambos orígenes. No inferir ingresos bancarios desde pagos marcados como 'paid'.

La función `lib/payments/bank-settlement.ts` evalúa un lote en memoria. Es necesario un ledger transaccional, webhooks firmados, RLS, pruebas de concurrencia, conciliación por fechas, monedas y referencias antes de activarlo.
