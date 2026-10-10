# LIRYGAMES — Auditoría de aislamiento de datos
Fecha: 2026-10-10. Inspección de código, no validación de datos de producción.

## Confirmaciones
- Despliegue de protección Comunidad READY, commit 9394b9ef.
- FrontDesk y login LIRYGAMES HTTP 200; API Top 10 responde desactivado.
- Comunidad incorpora bloqueo de consultas y escrituras al backend compartido; no crear registros ficticios.

## Riesgos de módulos sin guarda equivalente
- Inicio Commander Center: leads, analytics_events, books, media_assets, crm_contacts, finance_transactions, community_members.
- Crecimiento: crm_contacts, crm_activities, analytics_events, leads, campaigns.
- Informes: leads, community_members, finance_transactions, ops_work_items y compras de juegos.
- Comercio: shop_orders, shop_products, shop_fulfillments, commerce_settings, eventos de compra.
- Finanzas: finance_accounts, finance_transactions, shop_orders, commerce_settings.
- Mensajes de contacto: tablas lirygames_contact_messages y lirygames_contact_history; revisar RLS y procedencia.

## Pendientes prioritarios
1. Definir pertenencia de datos por estudio mediante studio_id y RLS, o backend independiente con aprobación previa de costos.
2. Auditar consultas y mutaciones en cada módulo, no solo páginas.
3. Diseñar pruebas de no interferencia con ambos estudios.
4. No activar datos ni registros hasta verificar identidad, RLS, ownership y auditoría.

Compartir el proyecto Supabase implica riesgo; no prueba por sí solo qué filas están mezcladas. No se modificaron tablas, usuarios ni políticas RLS.