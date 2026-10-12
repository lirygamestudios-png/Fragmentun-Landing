# LiryBoost — Registro auditable y revocación de consentimientos
Estado: PREPRODUCCIÓN. Especificación solamente; no crea tablas ni habilita inscripciones.

## Fuente de verdad
La aceptación de bases debe quedar vinculada al `auth.users.id` verificado por el servidor. La versión de las bases debe provenir de la configuración oficial vigente y no de parámetros enviados por el visitante. El cliente puede expresar su aceptación, pero **no puede declarar que ya fue registrada**.

## Eventos inmutables propuestos
- `accepted`: ID de evento aleatorio, ID interno del usuario, versión aprobada de bases, timestamp UTC emitido por base de datos, procedencia del servidor y referencia de la revisión vigente.
- `withdrawn`: ID de evento, referencia a aceptación previa, timestamp UTC emitido por base de datos, alcance del retiro y mecanismo de confirmación.
- `updated_terms`: versión antigua/nueva de las bases. Debe suspender atribuciones si se exige nueva aceptación.
No almacenar IP, correo, tokens de sesión, contraseñas ni información de menores en el historial de eventos.

## Invariantes
1. Los eventos son append-only: no reemplazar una aceptación con un simple booleano.
2. Una aceptación solo es vigente si su versión coincide con las bases exigidas y no existe una revocación posterior.
3. Las comprobaciones de vigencia deben ejecutarse en la misma transacción autorizada que acredita una invitación; un estado calculado minutos antes no garantiza vigencia.
4. El retiro detiene nuevas atribuciones inmediatamente; definir con asesoría legal si retira también la participación de rankings.
5. Una aceptación nueva después de revocar requiere acción explícita y genera un evento distinto; nunca reactivar por defecto.
6. Solo un servidor autenticado puede registrar eventos y asociarlos a la cuenta real.
7. Aplicar política de conservación y eliminación, acceso de mínimo privilegio y auditoría de cambios administrativos.
8. Mantener `program_active=false` en todo momento hasta cumplir los requisitos legales, de verificación y de datos.

## Pruebas obligatorias antes de producción
- Una solicitud sin sesión no registra consentimiento.
- Dos aceptaciones duplicadas y concurrentes no crean versiones de estado ambiguas.
- Una revocación concurrente con una acreditación produce un orden transaccional único y auditable.
- Reintentos de red con la misma clave idempotente no crean eventos duplicados.
- La versión de bases alterada en el navegador no queda aceptada.
- La baja detiene invitaciones y publicidad del alias de acuerdo con las bases.
- La API pública no revela identidad ni historial de eventos.

## Alcance de este paso
No hay migración, trigger, endpoint de escritura ni consulta de datos personales. La integración se hará después de revisar bases oficiales, política de privacidad y esquema privado.
