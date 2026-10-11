# LIRYGAMES STUDIOS — Diseño de trazabilidad de eventos de videojuegos

Fecha: 2026-10-11. Estado: **documento de arquitectura, implementación real pendiente**.

## Evidencia de pruebas
Los registros de Vercel correspondientes al despliegue del commit `1fb8774d49579f0d441204a42fc11dcc36fb45cf` muestran **24 pruebas aprobadas, 0 fallidas**. Esta evidencia solo cubre pruebas automatizadas de contratos, no autenticación ni tráfico real de servidores de juego.

## Principios de integridad
1. Los eventos de videojuegos proceden exclusivamente de servidores autorizados, nunca del navegador o del FrontDesk.
2. Cada evento lleva un identificador estable y único asignado por un emisor autenticado. Una retransmisión del mismo evento conserva el identificador original.
3. Se valida titularidad de cuenta, videojuego y origen; el contexto autenticado prevalece sobre los valores del mensaje.
4. Una tabla futura registra una **clave única por emisor y evento**; los duplicados no vuelven a conceder XP.
5. La inserción de la clave de idempotencia y la acreditación de XP forman una **única transacción atómica**. Si falla cualquier operación, se revierte todo.
6. Una respuesta repetida informa que el evento ya fue procesado, sin duplicar la recompensa. Se conserva la referencia al evento original.
7. Los rechazos se registran de manera proporcional y sin incluir secretos ni datos personales innecesarios.
8. La revocación de un servidor bloquea nuevos eventos; se conserva la trazabilidad de los anteriores según el plazo de retención aprobado.
9. Los códigos públicos ocultan los nombres de las IP que todavía requieren registro.

## Estados de procesamiento previstos
- `received`: solicitud recibida por el servicio autenticado.
- `rejected`: emisor, cuenta, juego o datos inválidos.
- `duplicate`: clave de idempotencia ya registrada; ningún XP adicional.
- `committed`: inserción y acreditación confirmadas en una misma transacción.

Los estados anteriores describen un contrato **futuro**; no existen aún registros ni endpoints que los procesen.

## Pruebas de aceptación pendientes de infraestructura
- Dos solicitudes simultáneas con el mismo ID solo acreditan un evento.
- Un reintento después de timeout no genera doble recompensa.
- Dos emisores distintos no pueden suplantarse ni reclamar eventos de otros.
- Un servidor revocado no puede acreditar eventos.
- El cliente no puede alterar el total XP por edición de respuestas.
- Una transacción abortada no deja crédito parcial.
- Las consultas públicas omiten identificadores internos, claves privadas y datos sensibles.
- La política de retención y eliminación respeta la revisión legal final.

## Decisiones del proyecto que permanecen intactas
Liry ID y Privacidad y preferencias conservan su diseño aprobado; los nueve mundos permanecen NO CONECTADO. No habilitar Auth, nuevas tablas de producción, pagos, métricas ficticias ni el Commander Center en esta fase.
