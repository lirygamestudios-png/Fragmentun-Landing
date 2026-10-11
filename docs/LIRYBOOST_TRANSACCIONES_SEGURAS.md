# LiryBoost — Contrato de transacción única (preproducción)

Estado: **DISEÑO, NO IMPLEMENTADO EN SUPABASE**. No habilitar registro de usuarios, enlaces activos ni recompensas por este documento.

## Problema
Dos solicitudes simultáneas podrían superar una comprobación de duplicados realizada en memoria y atribuir dos invitaciones al mismo invitado. La prevalidación TypeScript no garantiza exclusividad.

## Restricciones y transacción propuesta
- Identidad: `inviter_id` y `invitee_user_id` corresponden a usuarios diferentes; validar ambos en servidor.
- Estado: el invitado debe estar verificado y ser elegible; el participante debe estar activo y haber aceptado las bases vigentes.
- Exclusividad: índice/constraint `UNIQUE(invitee_user_id)` en la tabla de atribuciones válidas. Se debe diseñar la semántica para revocación antes de migrar: si se permiten anulaciones, la política debe impedir reacreditación fraudulenta.
- Una transacción ACID debe verificar elegibilidad, consentimiento y estado de la invitación e insertar la atribución. La segunda solicitud concurrente debe producir una respuesta idempotente sin sumar puntos.
- El contador público se calcula a partir de atribuciones válidas, nunca del número de visitas, clics o de un contador editable por el navegador.
- La función de acreditación debe residir en un contexto servidor autorizado con mínimo privilegio; no exponer una función privilegiada en el esquema público.
- Guardar versión de regla, fecha, autoría del evento y referencia de evidencia de verificación con retención limitada; nunca datos secretos en el ranking.
- Si falla la transacción, no conceder puntos ni publicar resultados parciales.

## Matriz de casos para pruebas
1. Atribución válida única → una sola fila verificada.
2. Dos solicitudes concurrentes del mismo invitado → solo una fila, sin doble crédito.
3. Invitado que intenta acreditarse a sí mismo → rechazado.
4. Invitado ya acreditado a otra persona → rechazado.
5. Usuario sin consentimiento o verificación → rechazado.
6. Programa no activo, reglas sin publicar o verificación inhabilitada → rechazado.
7. Revocación/expiración → no reapertura implícita de crédito.
8. Intento de escritura desde cliente anónimo → rechazado por permisos/RLS.
9. Alias duplicados entre participantes distintos → dos identidades distintas; el ranking nunca revela UUID.
10. Datos de identidad inválidos o actor no autorizado → rechazados y auditados sin filtrar secretos.

## Condiciones previas a la migración
Confirmar bases legales, elegibilidad, privacidad y protección de menores, autenticación, política de revocación, retención de datos, roles, y el dominio oficial. Auditar la propuesta de SQL, sus permisos y políticas RLS en una etapa separada.

**No modificar la base de datos productiva ni activar LiryBoost automáticamente.**
