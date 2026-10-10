# LIRYBOOST — Integración de identidad del Commander Center (pendiente)

## Verificación del código existente — 2026-10-10

La autenticación real usa Supabase Auth y la tabla admin_profiles para consultar roles. El segundo factor de LIRYGAMES no es un booleano confiable enviado por el cliente: en app/api/admin/lirygames/mfa/verify/route.ts se comprueba un factor TOTP verificado con nombre lirygames commander, se genera un token aleatorio, se almacena su hash en admin_mfa_context_sessions con contexto lirygames_commander y se emite la cookie HttpOnly liry_mfa_context con ruta /admin y vencimiento de ocho horas.

**Consecuencia de seguridad:** esa cookie no viaja automáticamente a /api/liryboost/top10. No ampliar su ruta ni consultar permisos administrativos desde el endpoint público. Mantener el Top 10 como lectura pública de datos ya filtrados y autorizados.

## Antes de habilitar acciones en Commander Center

1. Crear un verificador de servidor bajo /admin que compruebe getUser() real, admin_profiles, nivel MFA y la cookie de contexto contra el hash y vencimiento persistidos. No basta con comprobar que la cookie exista.
2. Confirmar los valores exactos de role de admin_profiles. Los nombres admin, owner, verifier, participant usados por el contrato son categorías propuestas; NO atribuir privilegios mediante equivalencias no verificadas.
3. Comprobar que la sesión de contexto pertenece al mismo user.id, al factor correcto y que no ha expirado ni se ha revocado.
4. Ejecutar verificaciones y revocaciones solo en rutas administrativas protegidas, con auditoría y transacciones.
5. Publicar en /api/liryboost/top10 únicamente alias consentidos y conteos verificables, sin identidad interna ni credenciales.
6. Mantener LiryBoost cerrado hasta aprobar bases, consentimiento, antifraude y fuente real. Sin escribir tablas de Supabase en esta fase.

Estado: arquitectura pendiente; no se ha creado endpoint administrativo ni se han concedido permisos reales.
