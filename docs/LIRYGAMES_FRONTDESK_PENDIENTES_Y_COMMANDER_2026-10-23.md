# LIRYGAMES STUDIOS — transición FrontDesk → Commander Center
Fecha: 2026-10-23 · Rama: `work/master-admin-implementation`

## Decisión aprobada
Pausar el trabajo de mejoras menores del FrontDesk. Mantener abiertas las pruebas finales y comenzar la actualización del Commander Center en `/admin/master`. No alterar FRAGMENTUN ni `main`. No habilitar registros reales, cobros, servicios de pago, proveedores biométricos ni servicios con costos.

## FrontDesk — pendientes de validación (NO aprobados todavía)
- [ ] FD-01: validar visualmente escritorio y móvil en todos los tamaños clave, sin desbordamiento y con estilo azul aprobado.
- [ ] FD-02: probar navegación del header, menús, modales, cierre y retorno del foco con ratón, teclado y táctil.
- [ ] FD-03: ejecutar Liry ADN de principio a fin, reabrirlo, reiniciarlo y comprobar la transferencia temporal al perfil (5–10 s).
- [ ] FD-04: validar filtros, búsqueda, paginación y enlaces compartidos del catálogo, incluso en móviles.
- [ ] FD-05: validar tienda, filtros combinados, 12 productos por página y enlaces profundos desde WhatsApp.
- [ ] FD-06: validar MI LIRY: avatar, vista temporal, navegación, formularios deshabilitados, privacidad y seguridad.
- [ ] FD-07: comprobar Comunidad, Liryboost, contactos, mensajes y formularios en vista preliminar sin envíos/cuentas activos.
- [ ] FD-08: auditoría de traducciones ES/EN, estados vacíos, accesibilidad WCAG y reducción de movimiento.
- [ ] FD-09: verificar tarjeta de WhatsApp/OpenGraph de MI LIRY en servicio externo real.
- [ ] FD-10: recorrido de aceptación final, seguridad, datos no ficticios y autorización previa al lanzamiento.

Estas tareas no quedan cerradas por compilar o por obtener HTTP 200. Requieren pruebas de interfaz/usuario antes de su aprobación.

## Commander Center — actualización activa
- [ ] CC-01: revisión visual y de navegación del sidebar y dashboard maestro sobre diseño ya aprobado.
- [ ] CC-02: revisar tablero y fuentes de KPI: usuarios activos, usuarios por juego, ventas del día y del mes. Indicar ausencia de datos, no fabricarlos.
- [ ] CC-03: auditar bandeja Clientes y Comunidad: lectura, pendientes, filtros, historial y permisos.
- [ ] CC-04: preparar gestión de desarrolladores: solicitud, evaluación, aprobación, auto-carga con control editorial y registro de auditoría.
- [ ] CC-05: módulo de verificación KYC/KYB/biometría: solamente diseño y políticas, pendiente proveedor, consentimiento, costo y autorización.
- [ ] CC-06: esquema futuro de liquidación y comisiones, pasarelas bajo habilitación administrativa explícita.
- [ ] CC-07: tutoriales por pantalla y selector ES/EN del panel.
- [ ] CC-08: pruebas de roles, MFA, seguridad, reportes e impresión.
- [ ] CC-09: IA de soporte y automatizaciones exclusivamente en fase de diseño hasta autorización.
- [ ] CC-10: validación visual por grupos de pantallas con aprobación del propietario.

Prioridad inicial: mantener visibilidad de FD-01 a FD-10 desde Commander y auditar el dashboard, sin cambios a servicios reales.
