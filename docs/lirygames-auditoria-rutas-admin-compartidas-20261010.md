# LIRYGAMES — Auditoría de operaciones compartidas
Fecha: 2026-10-10
Estado: diagnóstico, sin cambios en APIs o Supabase.

## Hallazgo crítico
Las rutas `/api/admin/campaigns`, `/api/admin/leads` y `/api/admin/integrations` usan el proyecto compartido y pueden servir funciones administrativas de FRAGMENTUN. Bloquearlas globalmente con la guarda de LIRYGAMES podría perjudicar FRAGMENTUN. No se debe hacerlo.

## Código revisado
- `app/api/admin/campaigns/route.ts`: GET, POST, PUT, DELETE. MFA general y roles admin/marketing; no se verificó pertenencia por estudio.
- `app/api/admin/leads/route.ts`: GET para consulta/exportación. MFA general; tabla leads sin filtro probado de estudio.
- `app/api/admin/integrations/route.ts`: GET, POST, PUT; revisar configuración y credenciales externas antes de aislar.
- `app/api/admin/commerce/*`: bloqueos preventivos ya aplicados. Revisar potencial impacto en FRAGMENTUN antes de considerarlos definitivos.

## Recomendación técnica
1. Mantener separadas rutas específicas: `/api/admin/lirygames/...` frente a `/api/admin/...` para FRAGMENTUN cuando corresponda.
2. Resolver identidad y autorización por contexto de estudio en servidor, sin confiar en parámetro enviado por navegador.
3. Filtrar por pertenencia de estudio mediante RLS y `studio_id`, o usar proyecto independiente tras aprobación de costos.
4. Validar desde ambas administraciones que la restricción no bloquea accidentalmente FRAGMENTUN.
5. Hasta entonces, no habilitar escrituras de LIRYGAMES en tablas compartidas ni afirmar aislamiento integral.

Esta auditoría no modifica datos ni activa servicios.