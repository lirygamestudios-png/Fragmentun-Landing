# FRAGMENTUN — Acciones externas pendientes

Este documento contiene únicamente tareas que ya no dependen del desarrollo del repositorio.

## 1. Vercel — corregir conexión/scope

Estado comprobado:
- La conexión actual de Vercel en ChatGPT solo ve el equipo:
  - slug: `lirygamestudios-7579`
  - team id: `team_mvUeLRoAh5AkXucIVKmlHJNV`
- Ese equipo devuelve **0 proyectos**.
- El repositorio no contiene `.vercel/project.json`.
- GitHub no muestra checks/statuses de Vercel en el último commit.

Acción:
- reconectar/autorizar Vercel con la cuenta o equipo donde realmente esté el proyecto FRAGMENTUN;
- verificar antes de crear nada nuevo si existe el proyecto esperado;
- evitar crear un duplicado mientras no se confirme el scope correcto.

Proyecto esperado según el trabajo previo:
- `fragmentunweblandingoficial01`

Cuando el scope correcto esté conectado:
1. obtener project ID y team ID;
2. verificar repositorio Git conectado;
3. verificar framework Next.js;
4. root directory debe quedar en la raíz del repo;
5. production branch: `main`;
6. revisar variables;
7. desplegar preview;
8. ejecutar QA;
9. promover a producción.

## 2. Variables de Vercel

Configurar para Production y, cuando corresponda, Preview:

### Públicas
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL=https://www.fragmentun.com`
- `NEXT_PUBLIC_PATREON_URL`
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_YOUTUBE_URL`
- `NEXT_PUBLIC_FACEBOOK_URL`

Dejar vacías hasta disponer de URL:
- `NEXT_PUBLIC_TIKTOK_URL`
- `NEXT_PUBLIC_X_URL`
- `NEXT_PUBLIC_FACEBOOK_COMMUNITY_URL`

### Secretas
- `MAILERLITE_API_TOKEN`
- `MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES`
- `MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN`

## 3. Primer administrador de Supabase Auth

Estado:
- `admin_access_allowlist`: 1 correo autorizado.
- `admin_profiles`: 0 actualmente.

Acción manual necesaria:
- crear/invitar en Supabase Auth el usuario cuyo correo ya está autorizado.

Después:
- el primer login/callback crea automáticamente `admin_profiles` con el rol de la allowlist;
- no es necesario insertar manualmente el profile.

Verificación:
- entrar en `/admin/login`;
- abrir Estado del sistema;
- confirmar perfiles administrativos > 0.

## 4. Supabase Auth URL Configuration

En Supabase Dashboard > Authentication > URL Configuration:

Site URL:
- `https://www.fragmentun.com`

Redirect URL:
- `https://www.fragmentun.com/auth/callback`

Para previews:
- añadir únicamente URLs de preview que realmente se utilicen;
- evitar wildcards amplios en producción.

## 5. MailerLite

Necesario:
- API token;
- grupo `FRAGMENTUN_CAP1_ES`;
- grupo `FRAGMENTUN_CAP1_EN` cuando exista contenido inglés final;
- IDs de grupos en variables de entorno.

Después:
- montar secuencia documentada en `docs/EMAIL_AUTOMATION_SEQUENCE.md`;
- prueba real de alta;
- comprobar estado `synced`;
- comprobar Email 1;
- comprobar unsubscribe;
- comprobar reintentos.

## 6. Dominio

No modificar DNS antes de tener un deployment de producción validado.

Orden:
1. preview Vercel;
2. QA;
3. production deployment;
4. asociar `fragmentun.com` / `www.fragmentun.com`;
5. aplicar DNS solicitado por Vercel;
6. esperar verificación SSL;
7. validar redirects y canonical.

## 7. QA de producción

Después del deploy:
- Desktop.
- Tablet.
- Mobile.
- Lighthouse.
- Login admin.
- Recuperación de contraseña.
- Logout.
- Captura de lead.
- Gracias.
- Capítulo 1.
- Test Emocional.
- Amazon.
- Patreon.
- Instagram.
- YouTube.
- Facebook.
- Analytics.
- Export CSV.
- Auditoría.
- Integraciones.
- Eliminación GDPR.
- `/api/health`.

## 8. Comunidad Facebook

Pendiente por decisión del proyecto.

No activar `NEXT_PUBLIC_FACEBOOK_COMMUNITY_URL` hasta que exista el grupo oficial.

## Estado técnico previo

Ya completado:
- Node 24.
- Next 15.5.27.
- sharp 0.35.4.
- npm audit: 0 vulnerabilidades.
- CI build.
- smoke tests.
- backend contract tests.
- Supabase Security Advisor: 0 alertas.
- RLS.
- health endpoint.
- privacidad/borrado retry-safe.
