# Simulaciones de pagos — ejecución futura aislada

Estado: **solo diseño y SQL borrador, sin migración aplicada**.

1. Crear un entorno Supabase aislado cuando comience la integración real. No alterar el proyecto productivo.
2. Revisar el esquema de `scripts/sql/20261008_payment_simulation_ledger_DRAFT.sql`. Las claves `(actor_user_id,idempotency_key)` garantizan unicidad por usuario; `request_fingerprint` detecta intentos de reutilización con contenido distinto.
3. Implementar un adaptador de servidor privado con credenciales exclusivamente de servidor, rol y MFA comprobados. Insertar una simulación; en conflicto, recuperar el registro anterior y comprobar la huella. Devolver el mismo recibo si coincide, HTTP 409 si difiere.
4. Ensayar dos solicitudes idénticas, dos simultáneas, y una tercera que cambie artículo o procesador pero conserve la clave. Exigir un solo registro en los dos primeros casos y rechazo del tercero.
5. Probar fallos del proveedor, devoluciones y falta de permisos. Verificar que nunca se escriba en `shop_orders`, `game_purchase_events`, `game_entitlements`, ni se registre ingreso real.
6. Mantener `REAL_PAYMENTS_ENABLED=false` mientras falten entidad legal, KYB, credenciales, auditoría, sandbox y aprobación humana.

**Situación hoy:** el simulador ya accesible utiliza un endpoint autenticado que NO persiste datos. El SQL es un borrador para preparación técnica; no existe todavía persistencia de prueba operativa.
