# Política de reembolsos y disputas para artículos virtuales LIRYGAMES

Estado: reglas de evaluación puras. No se han conectado pasarelas reales, ningún artículo se revoca automáticamente y no se crean cargos.

## Reglas
- Confirmación del proveedor y evento confiable son condiciones imprescindibles.
- **Disputa/chargeback abierto:** señalar revisión humana y posible suspensión; no suspender automáticamente.
- **Reembolso total confirmado:** señalar posible revocación cuando el artículo no está consumido; los consumibles deben revisarse individualmente.
- **Reembolso parcial:** revisión humana; no retirar de forma automática.
- **Pago confirmado sin eventos adversos:** conservar el derecho de uso.
- **Evento no verificado o datos contradictorios:** no modificar inventario, abrir revisión.

Toda decisión administrativa futura debe registrar actor, motivo, fecha, orden y referencia externa. Implementación inicial: `lib/payments/refund-dispute-policy.ts`. Esta función sugiere decisiones; no ejecuta modificaciones.
