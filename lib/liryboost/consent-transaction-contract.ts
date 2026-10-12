/** LiryBoost: contrato de persistencia atómica; preparación sin conexión a base de datos.
 * No autoriza operaciones, no guarda datos y no genera confirmaciones artificiales.
 * El adaptador real deberá validar auth.getUser(), RLS y UNIQUE dentro de PostgreSQL.
 */
import {reviewConsentOperation,type ConsentOperation} from "./consent-idempotency.ts";
import {classifyStoredConsentOutcome,type StoredConsentOutcome} from "./consent-persistence-outcome.ts";
import {reviewLiryBoostCentralSecurity,type CentralSecurityCheck} from "./central-security-gate.ts";

export type ConsentTransactionResult=
 | {ok:false;status:"invalid"|"unconfirmed"|"conflict"}
 | {ok:true;status:"committed"|"replayed"};

export function reviewConsentTransactionResult(
 operation:ConsentOperation,
 serverActorId:unknown,
 persistedOutcome:StoredConsentOutcome
):ConsentTransactionResult{
 const input=reviewConsentOperation(operation);
 if(!input.valid||typeof serverActorId!=="string"||
    typeof operation.actorId!=="string"||
    operation.actorId.toLowerCase()!==serverActorId.toLowerCase())
  return {ok:false,status:"invalid"};
 const verified=classifyStoredConsentOutcome(input.fingerprint,persistedOutcome);
 if(!verified.acknowledged)return {ok:false,status:verified.status==="conflict"?"conflict":"unconfirmed"};
 return {ok:true,status:verified.status==="replayed"?"replayed":"committed"};
}

/** Composición de controles preparatorios: la autorización exige compuerta central.
 * La confirmación persistida sigue siendo una declaración del adaptador futuro,
 * nunca evidencia creada por este módulo.
 */
export function reviewGatedConsentTransaction(
 operation:ConsentOperation,
 serverActorId:unknown,
 centralCheck:CentralSecurityCheck,
 persistedOutcome:StoredConsentOutcome
):ConsentTransactionResult{
 const gate=reviewLiryBoostCentralSecurity(centralCheck);
 if(!gate.permitted)return {ok:false,status:"unconfirmed"};
 return reviewConsentTransactionResult(operation,serverActorId,persistedOutcome);
}
