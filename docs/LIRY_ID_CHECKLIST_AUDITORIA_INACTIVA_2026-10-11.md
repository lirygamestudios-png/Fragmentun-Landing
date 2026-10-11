# LIRYGAMES STUDIOS — Auditoría de activación Liry ID

Fecha: 2026-10-11. Estado: no habilitado.

## Comprobaciones incorporadas
El módulo `lib/games/liry-readiness-audit.ts` ejecuta comprobaciones deterministas de la configuración declarada. Detiene la ejecución si:
- la identidad expuesta deja de ser visitante;
- aparece actividad supuestamente verificada;
- cambia el número de nueve códigos públicos o alguno pasa de NO CONECTADO;
- un puerto de Auth, perfiles, eventos o auditoría figura configurado sin la fase de implementación;
- el guardián de activación permite proceder sin aprobación de servidor.

La auditoría de configuración **no comprueba por sí sola** integración real, seguridad de bases de datos, políticas de acceso ni funcionamiento end-to-end.

## Criterios pendientes de integración real
1. Credenciales y sesiones gamer segregadas de administración.
2. Verificación de correo y recuperación segura.
3. Permisos del propietario y protección del perfil.
4. Consentimiento registrable, sin suscripción promocional automática.
5. Servidores de videojuegos autorizados y eventos firmados o autenticados.
6. Idempotencia y protección anti-replay para XP y recompensas.
7. Pruebas de revocación, fallos de red, auditoría y retención.

## Reglas visuales que deben permanecer
No modificar Liry ID, Privacidad y preferencias ni el selector de idioma aprobados. Evitar scroll innecesario y sangrías anómalas. No publicar títulos de IP internos.
