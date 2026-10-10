# LIRYGAMES — laboratorio aislado para pruebas de Comunidad

Estado: diseño preparado, **sin laboratorio creado**.

## Destino
Crear proyecto Supabase independiente de FRAGMENTUN. Seleccionar organización y aprobar costo de manera explícita antes del aprovisionamiento. No reutilizar URL, llaves, usuarios ni Auth de producción.

## Preparación reproducible
1. Crear el proyecto de pruebas en región us-east-1 si es aceptada por el propietario.
2. Versionar e instalar en el entorno de pruebas exclusivamente las dependencias de Comunidad: `community_members`, `community_actions`, `admin_profiles`, `admin_mfa_context_sessions`, auditoría, políticas y funciones.
3. Aplicar los esquemas base pertinentes antes de las migraciones de Comunidad, conservando su orden y verificando integridad referencial. **No aplicar a ciegas todas las migraciones de FRAGMENTUN.**
4. Mantener variables de Preview específicas y protegidas. No poner claves secretas en variables `NEXT_PUBLIC_*`.
5. Utilizar usuarios y datos sintéticos solo en laboratorio; MFA de prueba separado del Commander Center real.
6. Ejecutar las pruebas de alta, asignación, reversión, saldos insuficientes, duplicados, concurrencia y acceso sin MFA.
7. Guardar evidencia, revisar discrepancias y eliminar los datos de prueba cuando termine la validación.

## Criterio de aprobación
Nada se marca como PASS sin evidencia ejecutada. Despliegue READY solo acredita compilación. No cambiar entorno de producción para realizar estas pruebas.

## Evidencia de inspección 2026-10-10
- Un único proyecto conectado a Supabase: FRAGMENTUN.
- Migraciones registradas hasta `community_restrict_direct_writes_20261010`.
- Comunidad en producción: 0 miembros y 0 actividades en comprobación previa.
- Preview del commit `0027b5bf`: READY.
