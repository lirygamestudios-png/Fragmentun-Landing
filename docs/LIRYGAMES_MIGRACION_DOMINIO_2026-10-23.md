# LIRYGAMES STUDIOS — Migración a www.lirygamestudios.com
Fecha: 2026-10-23 · Estado: preparación — **NO MIGRADO**
## Situación comprobada
Vercel solo tiene un proyecto en el equipo: `fragmentunweblandingoficial01`. Ese proyecto sirve `www.fragmentun.com` y `fragmentun.com`. La rama LIRYGAMES es `work/master-admin-implementation` y la interfaz pública está hoy bajo `/lirygames`, con Commander Center bajo `/admin/master`.
## Arquitectura aprobada como objetivo
1. Crear proyecto **independiente** en Vercel `lirygames-studios`, sin redirigir ni reemplazar dominios de FRAGMENTUN.
2. Conectar GitHub a la fuente de LIRYGAMES con **rama de producción explícita**, idealmente en repositorio separado para evitar empaquetar código y secretos de FRAGMENTUN.
3. Preparar rutas de producción pública en raíz del dominio y login administrativo en ruta propia protegida; confirmar redirecciones y enlaces absolutos de WhatsApp/OpenGraph.
4. Aislar variables de entorno, credenciales y configuración Supabase; verificar límites de acceso, MFA e independencia operacional.
5. Revisar costos/cuotas de nuevo proyecto y solicitar autorización antes de activar prestaciones de pago o aumentar consumo.
6. Agregar `www.lirygamestudios.com` y `lirygamestudios.com` **solo al proyecto nuevo**; obtener del panel sus DNS/registro de verificación exactos, sin inventarlos.
7. Configurar DNS en registrador, confirmar SSL, redirección apex → www, SEO, correo y contactos existentes (sin reemplazar MX/SPF/DKIM si existieran).
8. Pruebas ES/EN, FrontDesk, Commander MFA, rutas API, enlaces compartidos y seguridad; cambiar dominio únicamente con aceptación.
## Restricciones
NO cambiar `main` ni `www.fragmentun.com`. NO hacer despliegue público definitivo sin aislamiento y pruebas. NO activar cuentas, pagos, verificación facial ni servicios con costos sin autorización.
## Commander Center
Continuar desarrollo y auditoría en rama LIRYGAMES. El dominio nuevo no es condición para completar los módulos pendientes.
