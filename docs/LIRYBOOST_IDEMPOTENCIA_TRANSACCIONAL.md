# LiryBoost — Idempotencia transaccional (especificación NO EJECUTAR)

Estado: preproducción. No aplicar migración ni habilitar escritura pública.

## Estado actual
Los módulos `consent-idempotency.ts` y `consent-history.ts` verifican formato y secuencias *en memoria*, pero **no impiden solicitudes paralelas**. Se requieren restricciones persistidas.

## Diseño para aceptación y revocación
- Asignar a cada operación un `operation_id` UUID que el cliente reutiliza al reintentar; autenticar al actor en servidor.
- Almacenar `actor_user_id`, `operation_id`, `operation_kind`, `rules_version`, `recorded_at` y estado final en esquema no expuesto.
- Crear `UNIQUE(actor_user_id, operation_id)` y comprobar que un reintento con la misma clave no cambió `operation_kind`, `rules_version` ni entidad objetivo; si cambian, rechazar con conflicto, no reproducir resultado incorrecto.
- Definir bloqueo por actor (fila/lock transaccional), y asignar secuencia dentro de la misma transacción. No depender de timestamps como único orden.
- Al revocar, detener inmediatamente nuevas acreditaciones que dependan del consentimiento; la transacción de acreditación debe consultar el estado vigente dentro de su propio límite de aislamiento.
- Mantener un historial append-only y devolver una respuesta idempotente al reintentar; las operaciones diferentes sí producen eventos separados si son legalmente válidas.

## Diseño para invitaciones verificadas
- `UNIQUE(invitee_user_id)` sobre la atribución definitiva, independientemente del alias público.
- Unicidad por invitado y operación de acreditación en base de datos, con transacción y controles de identidad, elegibilidad y consentimiento vigentes.
- Solo contabilizar filas confirmadas; nunca otorgar puntos por clic, visualización, evento provisional ni éxito de una función local.
- Transacciones concurrentes del mismo invitado deben generar una única atribución o una respuesta explícita de duplicado, con auditoría suficiente.

## Casos de prueba de integración (pendientes)
1. Dos envíos simultáneos con mismo actor y operación producen una sola aceptación.
2. La misma clave con otra versión de bases retorna conflicto sin cambiar el evento original.
3. Revocación concurrente con acreditación no permite acreditar contra consentimiento retirado según orden serializado.
4. Dos participantes reclaman un mismo invitado: solo uno gana por reglas documentadas y atomicidad.
5. Reinicio del servidor/reintento de red no duplica filas.
6. Usuario anónimo o con sesión no verificada no escribe eventos.
7. Top 10 solo refleja atribuciones elegibles, confirmadas y consentidas.

## Bloqueadores
No hay aún tablas LiryBoost ni autenticación de jugador operativa en esta función. Antes de crear tablas o procedimientos: revisar leyes y bases oficiales, política de revocación, roles/RLS, retención, riesgos de menores y aprobación expresa del lanzamiento.

Este documento no constituye una migración ejecutable.
