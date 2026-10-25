# LIRYGAMES STUDIOS — Puertas de calidad del FrontDesk

Última auditoría de código: 25 de octubre de 2026.
Referencia actual de código verificada: Preview Vercel READY `96a5d05ac758765a00bcf81e20711b8d114a1304`, despliegue `dpl_BzWZh2X5s3hyBFFmtuEKZad9qKCh`, URL `https://lirygames-studios-frontdesk-9nwqjhgok-lirygamestudios-7579.vercel.app/lirygames` (bloque Catálogo + Tienda + Liry ADN compilado; commit GitHub/Vercel coincidente).
**Este documento NO certifica pruebas visuales manuales que aún no se han realizado.**

## Verificaciones confirmadas

- [x] Build del Preview READY en Vercel y commit de despliegue coincidente con la rama de trabajo al verificarlo.
- [x] Metadatos de LIRYGAMES usan respaldo propio, no dominio de FRAGMENTUN; existe prueba de regresión.
- [x] Vercel informa SSO habilitado para previews: las pruebas externas requieren acceso autenticado.
- [x] Las 9 imágenes de tarjetas `public/liry-assets/world-01.webp` a `world-09.webp` existen en Git.
- [x] Recursos `public/liry-dna-cinematic.svg`, `public/LIRY_DNA_Hiperrealista.png` y `public/lirygames-brand-icon.svg` existen en Git.
- [x] El código incluye retorno de enfoque al disparador al cerrar ficha de catálogo, con guardia `isConnected`.
- [x] El código incluye cierre del menú móvil con tecla Escape y `preventDefault()`.
- [x] Bloque de navegación/búsqueda compilado en READY: se comprueba `isConnected` antes de enfocar el menú, destinos y resultados, con pruebas de regresión.
- [x] El componente de tienda implementa filtros, paginación y retorno de enfoque al cerrar categoría.
- [x] La vista previa de compartir comprueba que su botón de origen aún exista antes de devolverle el enfoque; prueba de regresión incorporada.
- [x] La prueba `tests/liry-whatsapp-product-share.test.mjs` actualizó sus tres expectativas obsoletas de enfoque/desplazamiento; la tienda conserva la guardia `match?.isConnected`. Commit de corrección `96a5d05a`; Preview READY confirmado por Vercel.
- [x] La compilación `npm run build` del Preview concluyó READY. Esto valida la puerta automatizada de compilación, NO los recorridos manuales de navegador.
- [x] Las nueve IP permanecen representadas públicamente mediante identificadores no reveladores.

## Bloqueos de cierre que requieren una sesión de navegador real

- [ ] Desktop: comprobar que las 9 tarjetas muestran sus imágenes correctas, con proporciones coherentes y sin desbordamientos.
- [ ] Móvil: comprobar cabecera, menú, botones con área táctil suficiente, filtros, ausencia de scroll horizontal.
- [ ] ADN: responder las 6 preguntas, completar, cerrar, repetir, confirmar enfoque y estado del perfil.
- [ ] Perfil: cargar y quitar avatar; comprobar mensajes de validación, configuración y subpantallas ES/EN.
- [ ] Catálogo: abrir/cerrar ficha con mouse, Escape y Tab; comprobar retorno del foco tras filtros.
- [ ] Tienda: buscar, filtrar, limpiar filtros, navegar páginas, abrir/cerrar categorías y enlaces compartidos.
- [ ] Liryboost, Comunidad y Social: verificar interacción y enlaces en ES/EN.
- [ ] WhatsApp: inspeccionar tarjeta compartida con un enlace público accesible y sus metadatos.
- [ ] Accesibilidad: contraste, zoom, teclado, lector de pantalla y modo reducir movimiento.
- [ ] Revisar errores de consola y solicitudes de red en desktop y móvil.

## Criterios de salida

El FrontDesk podrá considerarse listo para pasar a la siguiente fase cuando:
1. No tenga errores críticos reproducibles en los recorridos anteriores.
2. Se haya validado visualmente desktop y móvil, tanto en ES como EN.
3. Se preserven nombres e IP no publicables y no se muestren datos comerciales ficticios.
4. Se acuerde explícitamente avanzar al Commander Center.

Sin activación de pagos, cuentas reales, publicaciones comerciales ni infraestructura con costos sin autorización.
