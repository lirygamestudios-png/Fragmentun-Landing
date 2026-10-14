# LIRYGAMES STUDIOS — Propuesta de expansión comercial y publicación independiente
Fecha: 2026-10-13 · Estado: BORRADOR ESTRATÉGICO EN REVISIÓN, NO APROBADO PARA ACTIVACIÓN.

## Objetivo
Capitalización progresiva desde el lanzamiento mediante dos líneas: videojuegos propios (nueve IP inicialmente reservadas) y servicio de publicación / comercialización para desarrolladores independientes. La plataforma deberá escalar a un catálogo total configurable de hasta 100 títulos visibles progresivamente, sin crear tarjetas ficticias ni exponer nombres de IP no registradas.

## Arquitectura del FrontDesk propuesta
- Un FrontDesk público y un catálogo unificado, con fichas cargadas desde fuente de publicación autorizada.
- Dos vías de acceso visibles y diferenciadas: JUGADOR (LIRY ID) y DESARROLLADOR (LIRY DEVELOPER).
- Separación de identidad, sesiones, permisos, datos económicos y privacidad de desarrolladores respecto a jugadores y Commander Center.
- Panel privado del desarrollador para postular un juego, ver estado editorial, firmar términos, subir materiales a infraestructura segura, consultar ventas, conciliación, saldos, pagos y atención a incidencias.
- La primera etapa no requiere habilitar checkout ni distribuir ejecutables; las fases comienzan con postulación revisada manualmente.
- El límite de 100 es de **capacidad funcional y presentación de catálogo**, no garantía de concurrencia de 100 videojuegos en ejecución. Esto último exige pruebas de carga independientes.
- Reserva comercial propuesta: nueve IP propias + hasta 91 terceros, revisable y sin hard-codear proporción.

## Política editorial propuesta, basada en borrador recibido
- Admisión: juego ejecutable terminado o muy avanzado; titularidad o licencias suficientes; contenido correcto; divulgación de IA; cumplimiento de plataformas destino.
- Contratos no exclusivos; PI 100% del desarrollador; autorización de publicación definida por territorios, tiendas y plazo; consentimiento escrito para sublicencias.
- No financiar producción por defecto; marketing, traducción o QA adicional solo por encargo y presupuesto aprobado.
- Tope propuesto de comisión LIRYGAMES: 15% de ingresos netos **contractualmente definidos por canal**, sin deducciones opacas y sin compensación cruzada entre juegos.
- Ejemplo del borrador: ventas 100, tercero retiene 30, base 70, comisión LIRYGAMES 10,50 y desarrollador 59,50, *solo si los términos del canal permiten esa estructura*; no trasladar como tarifa universal.
- Liquidación del borrador: trimestral + 30 días. **Pendiente cambiar** a mensual / tras disponibilidad y conciliación del dinero para sostener la promesa de pagos rápidos. Las tiendas externas controlan sus propias fechas de desembolso.
- Duración borrador: 2–3 años, preaviso de 60 días y no renovación automática. Revisar relación entre terminación, revocación y compromisos de servicio/reembolsos.

## Cuestiones a resolver con el propietario antes de fijar un contrato
1. ¿LIRYGAMES vende directamente y entrega el juego en su sitio, o presta servicio de publisher en Steam/Epic/GOG, o ambas modalidades? El flujo de cobro, disponibilidad de reportes y permisos son distintos.
2. ¿La comisión del 15% se aplicará a ambos canales, con posibles condiciones distintas?
3. ¿Qué coste y plazos exactos asumirá LIRYGAMES por publicar en su propia plataforma y por actuar como publisher externo?
4. ¿Lanzamos primero un programa de postulaciones manual (sin pagos) o marketplace con cobro/entrega verificados?
5. ¿Cómo se administran las reservas, disputas, impuestos, pagos transfronterizos, KYC/AML, menores y políticas de reembolso?
6. Confirmar la aprobación del cambio de navegación/diseño y de los textos públicos ES/EN.

## Fases propuestas
Fase A: preservar FrontDesk aprobado; diseñar catálogo de 100 con paginación, búsqueda, filtros, carga progresiva y controles de publicación; dos entradas a logins sin mezclar identidades; postulación simple inactiva hasta revisar políticas.
Fase B: autenticación de desarrollador con verificación de identidad comercial, RLS, separación de tenants, consentimiento y gestión de postulaciones.
Fase C: revisión de títulos, QA, gestión de derechos, acuerdos y publicación selectiva; ventas solo tras gateway de pagos/reconciliación autorizado.
Fase D: liquidaciones verificables, reportes por juego, política de devoluciones/retenciones, protección de balances; publicación en terceros únicamente conforme acuerdos con cada tienda.
Fase E: pruebas de escalabilidad, observabilidad y capacidad operacional; certificación legal previa al lanzamiento comercial.

## Impacto en auditoría vigente
Se incorporan **2 iniciativas estratégicas nuevas** al inventario existente: (1) catálogo escalable hasta 100 y (2) portal de desarrolladores y publishing. Su desglose en tareas técnicas y nuevo total global se fijará tras definir el alcance comercial, para no confundir el 25 anterior con tareas nuevas de dimensión desconocida.

## Protecciones
Sin cambios en producción, autenticación, pagos o Commander Center en esta fase. Mantener nombres de IP propias protegidos, estética aprobada y política de cero costes no autorizados. Este documento no equivale a contrato ni validación legal; consultar asesoría especializada antes de prometer plazos de pago o comisiones definitivos.

Base: archivo adjunto del usuario «políticas para tu plataforma de publicación independiente.docx», ocho páginas.
