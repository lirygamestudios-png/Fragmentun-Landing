# LIRYGAMES | LIRY DEVELOPERS — MODELO OPERATIVO AUTOMATIZADO (2026-10-18)

Estado: diseño preliminar aprobado para documentación de arquitectura; no representa habilitación de servicios, tarifas, pagos ni cuentas reales.

## Límites
- Mantener FRAGMENTUN sin cambios y trabajar en rama work/master-admin-implementation.
- Sin servicios de pago, suscripciones, KYC ni transferencias reales hasta autorización explícita.
- Proteger la IP, publicar juegos de terceros solo tras visto bueno y contrato.
- Separar ingresos internos de reportes externos; ninguna API financiera garantiza derechos sobre fondos ajenos.

## Módulos
1. Onboarding: autoservicio, titularidad de IP, revisión contractual y KYC delegado a proveedor regulado.
2. Motor de ingresos: registros contables inmutables, idempotencia por transacción, impuestos, reembolsos, contracargos, comisiones por contrato y conciliación. Sin decisiones monetarias de IA.
3. Liquidaciones: proveedor autorizado, reglas de elegibilidad, saldos disponibles, reservas, bloqueos, verificaciones y auditoría; cuentas bancarias no almacenadas directamente.
4. Reportes: brutos, impuestos, procesador, devoluciones, comisión, neto, tasa de cambio y fecha/estado del pago; CSV/PDF después de contar con datos reales.
5. Soporte: artículos de ayuda y consultas; en fase posterior IA de lectura sin permisos para ordenar transferencias o cambiar tasas.

## Ventas
- Internas: plataforma propia recauda cuando exista integración de marketplace, gestiona reglas contractuales y ordena desembolsos.
- Externas: plataformas terceras pagan según sus condiciones; las integraciones pueden permitir consulta de datos pero no liquidación o deducción automática; cualquier comisión se factura conforme contrato.
- Referidos: atribución y remuneración únicamente si el acuerdo la prevé y existen datos verificables.

## Modelo de estados
developer: draft -> submitted -> identity_pending -> contractual_review -> approved | rejected | suspended
game: draft -> submitted -> ip_review -> approved -> published | suspended
ledger: captured -> reconciled -> eligible -> paid | held | reversed
payment: pending -> processing -> confirmed | failed | disputed

## Separación de responsabilidades
Desarrollador: sube metadatos y juegos, mantiene IP, consulta estados, actualiza datos con proveedor.
Sistema: validaciones de forma, cálculos fijos, conciliación, reportes, avisos.
Proveedor de pagos: KYC, custodia y transferencia de fondos dentro de sus capacidades.
LIRYGAMES: define criterios, aprueba publicación y resuelve excepciones, supervisa auditoría.
Commander Center: futuro módulo de supervisión. No iniciar desarrollo hasta cerrar FrontDesk.

## Gate de activación
Concluir FrontDesk y QA accesibilidad ES/EN; implementar backend con control de acceso por desarrollador y consentimiento; cerrar revisión contractual/legal/fiscal; verificar capacidades por país con proveedores; activar sandbox y pruebas contables; aprobar producción y monitoreo con registros reales.
