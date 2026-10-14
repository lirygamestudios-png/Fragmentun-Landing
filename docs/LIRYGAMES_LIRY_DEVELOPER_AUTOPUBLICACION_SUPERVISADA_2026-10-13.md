# LIRYGAMES STUDIOS — LIRY DEVELOPER: autopublicación supervisada
**13 octubre 2026 · Decisión funcional aprobada, implementación pendiente**

## Principio operativo
El desarrollador hace el trabajo rutinario desde su propio panel; LIRYGAMES retiene la facultad exclusiva de admisión, aprobación de publicación, suspensión y liquidación controlada. Objetivo: operar un catálogo progresivo de hasta 100 videojuegos sin multiplicar tareas administrativas manuales.

## Roles y permisos
- **Solicitante:** registro diferenciado del jugador; presenta solicitud Premium/Freemium y documentación.
- **Desarrollador admitido:** edita la ficha propia, carga imágenes y builds a zona privada de cuarentena, propone precios, registra datos comerciales y solicita revisión.
- **Revisor autorizado LIRYGAMES:** verifica elegibilidad, derechos, contenido, seguridad y calidad mínima; aprueba o rechaza una versión y configuración concreta, con registro auditable.
- **Finanzas autorizado:** supervisa conciliación, reservas justificadas y liquidación de saldos. Separación de funciones para operaciones sensibles.

## Flujo y estados propuestos
DRAFT → SUBMITTED → ADMISSION_REVIEW → ADMITTED → UPLOADED_PRIVATE → AUTOMATED_CHECKS → PUBLICATION_REVIEW → APPROVED → PUBLISHED.
Ramas: NEEDS_CHANGES, REJECTED, SUSPENDED, UNPUBLISHED.
- La admisión da permiso de subir y preparar material, **no** derecho de autopublicación pública.
- Toda build queda privada/inaccesible al público hasta autorización humana de la versión y hash específicos, ficha/precio/categoría y Release Gate.
- Subidas posteriores no reemplazan builds públicos sin nueva validación; revisar también modificaciones de monetización, calificación, permisos de datos, SDK y precios.
- El creador puede retirar voluntariamente publicaciones siguiendo reglas de consumidores, derechos adquiridos, reembolsos y conservación legal.
- Cada expediente debe mostrar motivos de rechazo, tareas pendientes y solicitud de reconsideración sin trabajo duplicado por correo.

## Automatización para minimizar operaciones de LIRYGAMES
- Formularios guiados y checklist dinámico según Premium/Freemium.
- Reglas automáticas: tipo de producto, archivo permitido, checksum, tamaño, verificación antimalware, metadatos, edad, licencias declaradas, exactitud de ficha, malware, dependencias y derechos declarados. Escáneres reducen riesgo, **no garantizan** seguridad o legalidad.
- Solicitudes incompletas regresan al desarrollador automáticamente.
- Cola única de revisión priorizada por riesgos, cambios sensibles e incidencias, sin inundar la administración con tareas simples.
- Notificaciones automáticas de estados, observaciones y deadlines; escalado humano de conflictos y reclamaciones.
- Reportes de ventas, comisión, reembolsos, reserva y saldo liquidable elaborados automáticamente desde ledger verificado.
- Conciliación automática con proveedor de pagos habilitado; desembolsos mediante proveedor autorizado, tras controles KYC/KYB, fiscales, antifraude y de fondos disponibles.
- Auditoría de permisos y eventos; no publicar ni liquidar únicamente por pulsaciones del navegador.

## Seguridad obligatoria
1. Identidad desarrollador independiente de LIRY ID jugador y Commander Center; autorización del servidor en cada recurso y aislamiento por desarrollador/organización (RLS, controles tenant).
2. Subida directa a almacenamiento privado mediante autorización corta, restringida a expediente/tipo/tamaño. Nunca dar permisos para sobrescribir artefactos aprobados ni publicar en producción.
3. Análisis en entorno aislado, bloqueo de ejecutables de alto riesgo, límites antiabuso, cuotas por desarrollador y protección ante subidas masivas. Los costos de almacenamiento y análisis necesitan presupuesto y aprobación antes de habilitar.
4. Aprobaciones con usuario, fecha, versión, hash, clasificación, producto, jurisdicción y reglas aplicables; revertir con historial.
5. No conectar cobros ni realizar payouts hasta definir merchant of record, procesador de marketplace, impuestos, reembolsos, chargebacks y contrato.
6. Protección de licencias adquiridas y cierre ordenado ante retirada del juego.

## Experiencia del FrontDesk
Dos accesos con rótulos inequívocos: **JUGADOR — LIRY ID** y **DESARROLLADOR — LIRY DEVELOPER**. Ambos con subpantallas coherentes con la estética aprobada, sin desplazar la landing. Un panel privado del desarrollador solo después de una sesión y autorización auténticas.

## Etapas
A. Diseñar flujos, estados y pantallas de solicitud sin permitir envíos reales.
B. Aprovisionar identidad aislada, consentimiento y privacidad.
C. Implementar postulaciones y revisión autorizada.
D. Subidas privadas, escaneo y aprobación por versión.
E. Publicación progresiva de catálogo hasta 100.
F. Ventas Premium/Freemium verificadas y liquidaciones auditables.

**No se han activado cuentas, subidas, ventas ni pagos. Sin creación de recursos con costo.**
