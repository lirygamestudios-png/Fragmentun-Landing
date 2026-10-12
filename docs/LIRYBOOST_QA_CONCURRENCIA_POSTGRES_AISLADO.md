# LiryBoost — Plan de pruebas concurrentes en PostgreSQL (solo entorno descartable)

**Estado:** preparado para QA; NO se ha ejecutado en Supabase, ni se ha creado un esquema real.
**Condición:** ejecutar exclusivamente en una base PostgreSQL de pruebas independiente, vacía y desechable.

## Preparación y aislamiento
- Crear un entorno de pruebas aislado, con credenciales sin acceso a producción.
- Confirmar la identidad de la base y ejecutar un guard que rechace nombres de BD de producción.
- Ejecutar scripts de inicialización en esquema temporal de pruebas, no sobre `public` ni `private` de producción.
- Generar UUID sintéticos y jamás copiar correos, tokens, sesiones o identificadores reales.
- Medir estado de las tablas después de cada pareja de transacciones; terminar eliminando el entorno descartable.

## Casos de concurrencia prioritarios

### C01. Un mismo invitado, dos promotores
Sesión A y sesión B intentan confirmar simultáneamente `invitee_user_id=X` con promotores distintos.
**Éxito:** exactamente una atribución definitiva y un rechazo/duplicado. El índice único del invitado debe ser la última barrera.

### C02. Un mismo operation_id, dos reintentos
Dos sesiones confirman la misma aceptación con el mismo actor/clave.
**Éxito:** exactamente un evento de consentimiento. Ambas respuestas remiten al mismo resultado o una señala replay, sin doble escritura.

### C03. Clave idempotente con contenido distinto
Las sesiones usan igual clave pero distintas reglas o clase de evento.
**Éxito:** una transacción gana y la otra recibe conflicto; la operación original queda intacta.

### C04. Revocación contra acreditación
Sesión A revoca el consentimiento y sesión B acredita una invitación; ordenar ambas con el mismo protocolo de bloqueo.
**Éxito:** resultado serializable documentado. No se acreditan invitaciones posteriores a una revocación ya confirmada.

### C05. Intento rechazado y posterior válido
Registrar intento fallido sin ocupar la clave única reservada a atribuciones confirmadas; después emitir intento válido.
**Éxito:** el primer intento no suma ni impide la atribución válida posterior.

### C06. Caída a mitad de operación
Inyectar fallo controlado entre evento y actualización de contador.
**Éxito:** rollback completo, ningún conteo huérfano.

### C07. Autorización y permisos
Intentar leer y escribir como `anon`, `authenticated` ajeno y cuenta autorizada.
**Éxito:** cero acceso privado no autorizado. Top 10 expone solo alias consentidos y conteos agregados.

### C08. Revocación de visibilidad
Publicar alias sintético, revocar permiso público y realizar nueva lectura.
**Éxito:** desaparece en la siguiente lectura consistente y no se sirve desde caché compartida.

## Criterios de salida
- Repetir C01–C04 al menos 100 veces con transacciones concurrentes y conservar resultados en un informe de QA.
- Ninguna violación de unicidad o contabilidad; cero atribuciones dobles.
- Pruebas de RLS, funciones privilegiadas e idempotencia sin fallos.
- Evidencia y revisión independiente de todos los casos bloqueantes.
- No conectar el proveedor real ni habilitar registro si algún caso crítico falla.

## Requisitos antes de preparar migración
Aprobar tratamiento de menores, bases oficiales, conservación de evidencia, fiscalidad de premios/beneficios si procede, reglas de revocación, roles mínimos y delimitación de atribución única.

**Nota:** las 239 pruebas actuales son unitarias y de compilación; no reemplazan estos ensayos reales de PostgreSQL.
