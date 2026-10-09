# LIRYGAMES — Prueba de persistencia de mundos internos (Modelo A)

Estado: protocolo preparado, **no ejecutado**.

## Contexto
- Nueve plazas del portafolio son **videojuegos**; cada videojuego tiene tres mundos **internos**.
- Los mundos 1, 2 y 3 son gratuitos y admiten compras opcionales dentro del juego.
- La migración candidata está en `scripts/sql/20261008_game_internal_worlds.sql`.
- La ruta de administración es `/admin/master/games/worlds`.
- La rama GitHub de trabajo es `work/master-admin-implementation`. No mezclar con `main`.

## Entorno y permisos
1. Preparar una **rama aislada de Supabase** y verificar su identificador; no utilizar el proyecto principal para probar DDL.
2. Revisar que las políticas existentes de `game_titles` y `admin_profiles` permitan los accesos previstos y que el rol editor pueda editar únicamente conforme a sus permisos.
3. Aplicar la migración **solo** en esa rama de base de datos, tras revisión del SQL. Confirmar que el rol anónimo carece de acceso a `game_internal_worlds`.
4. El Preview de Vercel actual utiliza posiblemente variables del proyecto principal. **No enviar escrituras de prueba desde el Preview existente**: crear un despliegue conectado expresamente a la rama aislada.
5. Crear un videojuego de prueba **solo en la rama aislada** y registrar mundo 1, 2 y 3 con nombres diferentes. Confirmar que la vista muestra los títulos y el estado correctos.

## Casos de prueba
- Crear el primer mundo con `planned`, `access_type=free`.
- Editar nombre, descripción e imagen: comprobar persistencia real tras recargar.
- Intentar duplicar `(game_id, world_number)`: debe actualizar el existente o producir error controlado, jamás crear un cuarto registro del mismo número.
- Rechazar números fuera de 1..3 y URLs que no sean HTTPS.
- Rechazar actualización de mundos `beta` o `available` mediante formulario de planificación.
- Dos ediciones concurrentes con estado distinto: rechazar la operación obsoleta.
- Sin sesión, sin MFA o sin rol admin/editor: denegar escritura.
- Cuenta anónima o gamer: no leer mundos internos en la base hasta que exista política pública aprobada.
- Sin tabla existente: aviso de persistencia pendiente y controles de edición ocultos.
- Estado `retired`: conservar registro; sin borrado en cascada.

## Bloqueos antes de lanzar
- Conectar el Preview a una base aislada, ejecutar migración y completar casos de prueba.
- Diseñar API pública de consulta que exija que juego y mundo estén efectivamente autorizados por el Release Gate.
- Registrar métricas y progreso gamer solamente con datos reales.
- Prueba autenticada de la vista y aprobación visual, manteniendo la identidad gráfica del Master Admin.

Este documento no equivale a migración ejecutada, prueba funcional superada ni habilitación pública.
