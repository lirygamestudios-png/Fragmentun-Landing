# LIRYGAMES — Política de pagos y proveedores (borrador de decisión)

Actualizado: 2026-10-08. Documento de planificación; **no implica contratación, elegibilidad confirmada ni cobros activos**.

## País de facturación confirmado por el promotor
**Estados Unidos**. La entidad jurídica específica (LLC/corporation), su constitución, EIN, cuenta bancaria y dirección real operativa todavía deben verificarse. No asumir que ya existe o que ha sido aprobada por ningún proveedor.

## Cuatro canales previstos

1. Stripe — primera preferencia para tarjetas y wallets en juegos web, sujeto a elegibilidad de la entidad que factura.
2. PayPal — opción secundaria y respaldo operativo, sujeto a modalidad y país del comercio.
3. 2Checkout / Verifone — alternativa internacional, pendiente de cotización, verificación comercial y aceptación de bienes digitales/virtuales.
4. Criptomonedas — proveedor administrado con cobros preferentemente en stablecoins (USDC), sujeto a cumplimiento, confirmación y liquidación.

**Criptomonedas, evaluación:** Coinbase Commerce ya no está operativo; Coinbase Business requiere una entidad elegible estadounidense o de Singapur (verificar al contratar). BitPay publica actualmente acceso a merchant onboarding principalmente en EE. UU. y Canadá; no presumir elegibilidad de República Dominicana. Revisar proveedores nuevos antes de contratar. Nunca usar una wallet individual como reemplazo improvisado de las obligaciones de cumplimiento y soporte.

Fuentes oficiales de referencia:
- https://help.coinbase.com/en/transitioning-from-coinbase-commerce-to-coinbase-business
- https://help.coinbase.com/en/coinbase/other-topics/business/business-overview
- https://support.bitpay.com/hc/en-us/articles/360000123366-What-countries-or-jurisdictions-does-BitPay-support
- https://stripe.com/global
- https://developer.paypal.com/payouts/supported-features/

## Reglas técnicas obligatorias
- La orden pertenece a un jugador autenticado, videojuego concreto, artículo y precio fijado por servidor.
- El servidor crea la sesión de cobro sin confiar en importes enviados por navegador; nunca almacenar PAN/CVV ni llaves privadas en frontend.
- Confirmación por webhook firmado o verificación del procesador en servidor; callbacks de navegador no conceden inventario.
- Usar idempotencia en pago y entrega (no duplicar artículos ni accesos tras reintentos).
- Conciliar referencia externa, moneda, importe, comisiones, impuesto, estado, devoluciones y disputa.
- No considerar un activo digital liquidado hasta cumplirse el criterio de confirmación del proveedor.
- Explicar tasas/red y mecanismo de devolución cripto antes de pagar.
- Los videojuegos distribuidos en iOS/Android deben cumplir las reglas de billing de la tienda correspondiente.
- La plataforma debe conservar registros auditables de transacciones y cambios administrativos.

## Fases
**Fase A:** selección del país y entidad facturadora; elegibilidad de cuatro proveedores; cotizaciones y condiciones comerciales de artículos virtuales.
**Fase B:** módulo administrable de proveedores con prioridades, disponibilidad geográfica y credenciales almacenadas en servidor; sandbox, no producción.
**Fase C:** prueba de compra de artículo virtual, webhook, derecho de uso, reembolso, conciliación y control antiabuso.
**Fase D:** activación real solo tras validación de seguridad, fiscalidad, TOS y aprobación humana.

## Decisión todavía imprescindible
**Resuelto:** país de facturación previsto = Estados Unidos. **Pendiente:** confirmar la entidad estadounidense específica y documentación para apertura de cuentas, KYC/KYB, aceptación de microtransacciones de artículos virtuales, moneda de liquidación, impuestos, tarifas y cobertura por región. Stripe y PayPal son candidatos prioritarios; 2Checkout requiere evaluación comercial; Coinbase Business es candidato cripto preferente sujeto a aprobación. No designar ningún proveedor como contratado hasta superar verificación.
