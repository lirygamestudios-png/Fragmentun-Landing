# LIRYGAMES STUDIOS — Liry ID: activación y partidas verificadas
Fecha: 2026-10-11. Estado: **preparación técnica — ningún sistema activo**.

## Alcance protegido
- FrontDesk Gamer público, independiente del inicio de sesión del Commander Center y cualquier administrador.
- Liry ID permanece en modo visitante; no solicitar ni almacenar credenciales hasta completar las pruebas de seguridad.
- No revelar nombres internos de las nueve IP: solo los códigos públicos aprobados.
- Privacidad y preferencias y acceso Liry ID: diseño visual aprobado, no modificar sin nueva solicitud.

## Bloqueos de activación
El contrato `lib/games/liry-activation-readiness.ts` mantiene **siete verificaciones en false**: autenticación aislada, correo verificado, perfiles con autorización por propietario, consentimiento, eventos de servidor, prevención de replay y auditoría. Una comprobación de front-end nunca debe convertirlas en true ni habilitar servicios sin comprobaciones de infraestructura.

## Ciclo de identidad esperado
1. Visitante: avatar temporal y afinidad Liry ADN en memoria; nunca XP persistente.
2. Registrado: sesión verificada desde una fuente Auth segregada; cuenta y preferencias privadas bajo autorización por propietario y política de privacidad aprobada.
3. Jugador activo: servidor de juego autorizado prueba titularidad de cuenta, asociación a código público y evento de actividad; solo entonces se acreditan partidas/XP/logros.

## Protocolo futuro de eventos de juego
- Únicamente servidor de juego autorizado: no aceptar reportes de XP o victorias del navegador.
- Validar credenciales del servidor y autorización de emisión; vincular evento con cuenta y videojuego.
- Identificador único de evento, idempotencia persistente y protección contra repetición.
- Marca temporal del servidor y controles de límites/consistencia; contabilidad de XP transaccional.
- Registro de auditoría con finalidad limitada, retención definida y sin exposición de datos internos.
- Proyección pública minimizada: cifras solo procedentes de la fuente verificada; ante ausencia/fallo mostrar guiones o NO CONECTADO.
- Probar escenarios de fraude, eventos duplicados, desconexión, revocación, cambio de cuenta y fallos de sincronización antes de activación.

## Pruebas de aceptación pendientes
- Separación total Gamer Auth / Admin Auth.
- Acceso a perfil ajeno denegado.
- Opt-in de marketing desactivado por defecto; consentimiento versionado.
- Cuenta sin juego mantiene actividad nula.
- Los nueve vínculos permanecen NO CONECTADO hasta verificación real.
- Un evento inválido o duplicado nunca genera XP.
- Errores del proveedor o red no generan éxitos simulados.
- Revisión legal y de privacidad antes de publicar términos vigentes.
- Auditoría visual desktop/móvil sin cambios sobre pantallas aprobadas.

## Fuera de alcance en esta fase
No crear proyectos Auth, tablas, políticas RLS, claves, pasarelas de pago ni activar API públicas desde este documento. Activación condicionada a infraestructura y autorizaciones futuras.
