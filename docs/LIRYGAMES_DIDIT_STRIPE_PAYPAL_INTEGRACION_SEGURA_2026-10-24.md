# LIRYGAMES STUDIOS — Plan de integración segura de identidad y pagos
Fecha: 2026-10-24
Rama: `work/master-admin-implementation`
Estado: DISEÑO / SIN ACTIVACIÓN / SIN TRANSACCIONES

## Confirmaciones del propietario
- Stripe Connect: cuenta abierta, integración API no comprobada.
- PayPal: cuenta abierta, integración API no comprobada.
- Didit: cuenta abierta; declaración de actividad y configuración de verificación por revisar.
- No se ha autorizado ejecutar KYC real, procesar pagos, desplegar servicios facturables ni aceptar desarrolladores automáticamente.

## Separación obligatoria
- Solo en LIRYGAMES, nunca en FRAGMENTUN.
- Repositorio históricamente compartido: prevenir reutilización de Supabase, credenciales, webhook endpoints y tablas entre marcas.
- Deshabilitar por defecto cualquier acción externa hasta validar entorno aislado y una autorización expresa de producción.

## Modelo de estados por solicitud del desarrollador
`draft → submitted → identity_pending → identity_review → business_review → contract_pending → approved → payment_onboarding_pending → publication_review → publishable`.
Ramas excepcionales: `needs_more_information`, `rejected`, `suspended`. Una aprobación de identidad jamás equivale automáticamente a aprobación editorial, contractual o de pagos.

## Identidad (Didit)
- Persona física: identificación, comparación facial y prueba de vida en flujo definido y previamente aprobado.
- Empresa: KYB y comprobación de la representación/beneficiarios cuando aplique, sujeto a país y disponibilidad.
- El flujo de verificación lo aloja Didit; no solicitar biometría en el servidor LIRYGAMES ni reproducir imágenes en Commander.
- Solo guardar: ID interno de solicitud, referencia opaca de sesión/proveedor, estado normalizado, marca temporal, motivo de revisión seguro y auditoría restringida. No guardar fotografías de documentos, plantillas faciales ni claves API.
- Evaluar contrato/DPA, base jurídica, consentimiento específico, plazo de retención, mecanismo de supresión, jurisdicciones y revisión manual antes de producción.
- Webhooks futuros: autenticación/firma conforme documentación vigente, idempotencia por ID de evento, validación de transición, logging mínimo sin PII y rechazo ante firma ausente/inválida.
- No asumir que el plan gratuito o las capacidades cubren KYB/AML ni todos los países; volver a comprobar la oferta antes de habilitar.

## Pagos
- Stripe Connect: modalidad de cuentas conectadas, comisiones, onboarding, payouts, reversos y responsabilidad fiscal por definir; el estado de cuenta abierta no valida API ni permisos.
- PayPal: decidir producto específico apropiado para compradores y, por separado, comprobar si ofrece payouts comerciales compatibles.
- Webhooks independientes, firma y replay protection; ledger conciliado con IDs de transacción idempotentes. No guardar tarjetas, números bancarios ni secretos.
- No habilitar reembolsos, transferencias, cobros ni onboarding real desde las páginas administrativas de planificación.

## Puertas de activación
1. Confirmar operación comercial, países, edades admitidas y políticas de desarrolladores.
2. Aprobar términos, avisos de privacidad, tratamiento biométrico y contrato con proveedores.
3. Aislar entorno LIRYGAMES (datos, API, secretos, host, dominios).
4. Configurar credenciales en almacén seguro del entorno, nunca en GitHub ni en campos de configuración legibles.
5. Probar casos exitosos, rechazados, expirados, reintentos y webhooks duplicados en sandbox, documentando evidencia.
6. Revisar permisos administrativos y MFA, trazabilidad, incidentes y retención.
7. Obtener autorización explícita de lanzamiento y gasto del propietario.

## Verificación actual
- Pantalla read-only: `/admin/master/integrations/providers`.
- No hay integración externa implementada ni pruebas funcionales reales completadas por esta fase.
- FrontDesk sigue con FD-01 a FD-10 abiertos. No equiparar compilación o HTTP 200 con aceptación.
