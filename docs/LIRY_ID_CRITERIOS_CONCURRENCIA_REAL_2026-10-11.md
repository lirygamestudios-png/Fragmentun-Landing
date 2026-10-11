# LIRYGAMES STUDIOS — Criterios para pruebas de concurrencia real

Fecha: 2026-10-11. **Pendiente de infraestructura**, no se han activado juegos ni bases de datos.

## Evidencia confirmada
Commit `89af73331daa294bcc5c82eae90c64babeb78795`: registros de Vercel muestran 28 pruebas aprobadas y 0 fallidas. Son pruebas unitarias de contratos y simulación secuencial, no pruebas ACID ni concurrencia simultánea.

## Condiciones previas
- Entorno aislado de ensayo, nunca la autenticación del Commander Center.
- Emisor de eventos gamer con autorización verificable, revocación funcional y cuenta vinculada a videojuego público permitido.
- Registro persistente de eventos con clave única (emisor, ID de evento).
- Inserción de idempotencia y acreditación de XP en una única transacción del servidor.
- Claves, políticas de acceso, auditoría y retención de datos revisadas.

## Casos de aceptación futuros
| Caso | Estímulo | Resultado obligatorio |
| --- | --- | --- |
| Dos solicitudes simultáneas | Mismo emisor e ID de evento | Solo una acreditación; otra marcada duplicada |
| Reintento tras timeout | Mismo evento ya confirmado | Respuesta idempotente, XP sin aumento |
| Fallo a mitad de transacción | Insertar evento y abortar antes de crédito | Reversión total, sin estado parcial |
| Fallo después de commit | Reintento sin conocimiento del éxito previo | No duplicar crédito ni evento |
| Emisor revocado | Evento nuevo después de revocación | Rechazo, auditoría sin crédito |
| Emisor diferente | Reutiliza ID igual al de otro emisor | Resolver por clave compuesta y validar titularidad, nunca asumir confianza |
| Cuenta ajena | Cuenta de evento distinta de autorización | Rechazo sin exponer datos privados |
| Otro videojuego | Código no asociado a emisor/cuenta | Rechazo |
| Carga concurrente | Muchas solicitudes con eventos únicos | Acreditación exacta y ningún evento perdido |
| Lectura pública | Consultar perfil de otro usuario | Sin identificadores internos ni datos privados |

## Criterios de aprobación
Todos los casos deben probarse con infraestructura real, conservar resultados y evidencia auditables. Vercel READY o las simulaciones existentes no demuestran estos requisitos. No activar XP, cuentas, estadísticas ni modos de juego hasta completar y aprobar estas pruebas.

## Exclusiones
No modificar el diseño de Liry ID, Privacidad, selector de idioma ni Commander Center; no mostrar nombres internos de IP.
