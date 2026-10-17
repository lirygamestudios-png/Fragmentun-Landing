# LIRYGAMES STUDIOS — activación controlada de Liry ID

**Estado:** BLOQUEADO. Este documento no habilita registro, sesiones, correos, base de datos ni cobros.

## Requisito previo

LIRYGAMES debe contar con infraestructura propia y separada de FRAGMENTUN. La revisión de proyectos disponibles (17/10/2026) mostró únicamente FRAGMENTUN; no se permite reutilizar su base, claves, usuarios, cookies administrativas ni almacenamiento de archivos como solución provisional. No crear recursos con costos sin aprobación.

## Secuencia de implementación

1. Identificar y autorizar un proyecto independiente de identidad y datos para LIRYGAMES; confirmar cuotas y costo antes de crear servicios nuevos.
2. Configurar URLs de retorno y dominios específicos de LIRYGAMES para confirmación de correo y recuperación. Nunca admitir redirecciones abiertas.
3. Crear sesiones seguras verificadas en servidor, cookies HttpOnly/Secure/SameSite, defensa CSRF y separación entre acceso público de jugador y administración.
4. Proteger registro e inicio de sesión contra abuso mediante límites de intentos y controles antiautomatización; evitar enumeración de correos en mensajes de recuperación.
5. Activar verificación de correo, recuperación con tokens de uso único y expiración, cambio de contraseña desde sesión verificada y revocación de sesiones.
6. Diseñar tabla de perfiles y preferencias con RLS habilitada y políticas SELECT/INSERT/UPDATE restringidas a auth.uid() del propietario, con WITH CHECK en UPDATE. No usar metadatos de usuario editables para autorización.
7. Crear bucket **privado** de avatares con reglas por propietario, tamaño <=3 MB, validación de contenido en servidor, nombres aleatorios, lectura autorizada o URL firmada de corta duración. No exponer fotos mediante URLs públicas permanentes.
8. Conectar las pantallas existentes de Mi Liry y Liry ID solamente después de validar las operaciones contra un entorno aislado de pruebas.
9. Verificar desde dos cuentas de prueba que ningún jugador pueda ver o modificar foto, preferencias, sesiones ni compras de otro; probar cierres de sesión y restauración desde otro dispositivo.
10. Realizar pruebas de ES/EN, accesibilidad, dispositivos móviles, compilación y despliegue. Activar indicadores solo después de auditoría.

## Condiciones para declarar terminado Perfil de Jugador

- Registro/inicio/cierre de sesión reales comprobados.
- Verificación y recuperación de correo operativas, con mensajes genéricos cuando corresponda.
- Contraseña modificable únicamente mediante operación segura del proveedor.
- Nombre, preferencias y foto del propietario persistentes entre dispositivos.
- Privacidad y permisos verificados en servidor, no solo simulados mediante interruptores.
- Inventario y compras: mostrar únicamente registros reales, mantener acciones de compra desactivadas.
- FRAGMENTUN sin modificaciones ni sesiones compartidas.

**Código actual:** `lib/games/liry-player-account-security.ts`, `lib/games/liry-auth-boundary.ts`, `lib/games/liry-player-profile-persistence.ts`, `lib/games/liry-avatar-storage-contract.ts`. Todos los controles de habilitación permanecen desactivados.
