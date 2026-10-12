# LiryBoost — Contrato de fuente autenticada para Top 10 (preproducción)

Estado: diseño de integración; NO conecta bases de datos ni activa LiryBoost.

## Condiciones obligatorias del proveedor
1. **Estado de publicación confiable:** `programActive`, `rulesPublished` y `verificationEnabled` deben proceder de configuración protegida del servidor, nunca del navegador.
2. **Fuente de verdad:** la clasificación se calcula exclusivamente a partir de invitaciones únicas verificadas y confirmadas en transacciones PostgreSQL.
3. **Identidad:** el participante debe corresponder a la cuenta elegible y autenticada; la identidad privada y los identificadores internos no se exponen al cliente.
4. **Consentimiento vigente:** consultar el estado de aceptación/no revocación y la autorización de aparecer públicamente, asociados a la versión de las bases aplicable.
5. **Lectura consistente:** validar elegibilidad, consentimiento y atribuciones dentro de una lectura consistente; un filtro local sobre información desactualizada no basta.
6. **Protección contra duplicación:** `UNIQUE(invitee_user_id)` en la atribución definitiva, junto con transacciones e idempotencia de operaciones.
7. **Datos mínimos:** el proveedor entrega solo alias autorizado, total confirmado e indicadores internos de verificación. Nunca correo, IP, token o nombre privado.
8. **Error seguro:** si un requisito de la consulta falla, devolver programa inactivo y lista vacía. No utilizar resultados de respaldo inventados.
9. **Retiro del listado:** revocación o inelegibilidad debe impedir aparición en la siguiente lectura autorizada; deshabilitar cache compartida hasta establecer reglas de invalidez.
10. **Fase de lanzamiento:** requerir pruebas de integración concurrente, RLS/grants, bases publicadas, privacidad y autorización explícita antes de sustituir el proveedor nulo.

## Situación actual verificada
- La ruta `/api/liryboost/top10` llama `readLiryBoostTop10(null)` y responde `programActive:false`, `leaderboard:[]`.
- El módulo `consent-current-top10.ts` filtra consentimiento, elegibilidad y verificación, pero sigue siendo lógica pura; no prueba la autenticidad de sus entradas.
- El proveedor `read-provider.ts` exige estado de publicación válido y rechaza errores.
- La respuesta pública se observó directamente con HTTP 200 y `Cache-Control: no-store`.

## Próxima secuencia técnica
A. Definir el modelo relacional y sus roles mínimos con revisión de seguridad.
B. Preparar migración aislada NO aplicada y pruebas de concurrencia de BD en entorno de pruebas.
C. Construir adaptador server-only con consultas parametrizadas y permisos explícitos.
D. Ejecutar pruebas end-to-end sin datos personales y con el programa cerrado.
E. Activar únicamente tras cumplir puertas legales y técnicas.

**No se ha autorizado aún la migración ni la activación.**
