# LiryBoost — Auditoría ampliada de exposición de funciones (2026-10-11)

**Alcance:** Supabase `pasoapugmsazziflaomp`, consultas de solo lectura. No cambios de permisos ni datos.

## Conteo verificado
| Esquema | Funciones | Invocables por anon (USAGE + EXECUTE) | Invocables por authenticated | SECURITY DEFINER |
|---|---:|---:|---:|---:|
| private | 4 | 0 | 3 | 4 |
| public | 6 | 1 | 4 | 5 |

Se consideran conjuntamente `USAGE` en esquema y `EXECUTE` de función; no equivale a garantizar accesibilidad a través del Data API.

## Funciones examinadas
- `public.liry_record_community_action` (SECURITY DEFINER): exige `auth.uid()`, perfil de rol admin/editor/marketing y sesión de contexto MFA `lirygames_commander` validada contra hash SHA-256 y vencimiento; bloquea fila de miembro y aplica cambio de puntos en la misma función.
- `public.liry_compensate_community_action` (SECURITY DEFINER): valida los mismos controles de identidad, rol y MFA, exige motivo, bloquea fila y registra corrección. Revisar unicidad de `correction_of` bajo operaciones simultáneas; el código hace comprobación de existencia, que por sí sola no sustituye un índice único.
- `public.lirygames_submit_contact` (SECURITY DEFINER): admite rol anon para el formulario público, valida longitudes y formatos, limita por correo a tres mensajes/hora y guarda mensaje. Comprobar de forma independiente controles externos contra envíos abusivos; el límite por correo dentro de función no es una garantía transaccional de protección frente a concurrencia.
- Funciones `private.is_admin*`: identificadas en la revisión anterior; validan `auth.uid()` y roles administrativos, sin exposición directa a anon mediante USAGE.

## Evaluación
Estas funciones implementan comprobaciones de autorización; **no se detecta aquí una vulnerabilidad explotable demostrada**. Se recomienda revisar índices de unicidad, permisos de ejecución explícitos, auditoría de MFA y pruebas concurrentes antes de adaptar cualquier patrón a LiryBoost. No reutilizar puntos comunitarios como créditos automáticos de LiryBoost.

## Pendientes
1. Auditar `pg_indexes` y restricciones de `community_actions.correction_of` sin alterar la base de datos.
2. Revisar exposición real del Data API, propietarios y privilegios de las funciones.
3. Diseñar nueva capa de invitaciones verificadas en esquema aislado y pruebas de escritura concurrente.
4. Mantener LiryBoost desactivado hasta aprobación legal y técnica.

**No se realizaron migraciones, GRANT/REVOKE, inserciones ni cambios visuales.**
