import {isIdentityDecision,type IdentityDecision} from "./liry-biometric-readiness";
/** Offline validation only. Not a webhook endpoint and never authenticates a provider. */
export type ProviderEventEnvelope = Readonly<{eventId:string;applicationId:string;providerReference:string;decision:IdentityDecision;issuedAt:string;expiresAt:string}>;
export type ValidationResult = Readonly<{ok:true;value:ProviderEventEnvelope}|{ok:false;reason:"invalid_shape"|"invalid_identifier"|"invalid_status"|"invalid_time"|"expired"|"future_event"|"replayed"}>;
const identifier=/^[A-Za-z0-9_-]{8,128}$/;
export function validateProviderEnvelope(input:unknown,nowMs:number,seenEventIds:ReadonlySet<string>):ValidationResult {
 if(!input||typeof input!=="object"||Array.isArray(input))return {ok:false,reason:"invalid_shape"};
 const item=input as Record<string,unknown>;
 for(const key of ["eventId","applicationId","providerReference"]){if(typeof item[key]!=="string"||!identifier.test(item[key] as string))return {ok:false,reason:"invalid_identifier"};}
 if(!isIdentityDecision(item.decision)||item.decision==="not_started")return {ok:false,reason:"invalid_status"};
 if(typeof item.issuedAt!=="string"||typeof item.expiresAt!=="string")return {ok:false,reason:"invalid_time"};
 const issued=Date.parse(item.issuedAt),expiry=Date.parse(item.expiresAt);
 if(!Number.isFinite(nowMs)||!Number.isFinite(issued)||!Number.isFinite(expiry)||expiry<=issued)return {ok:false,reason:"invalid_time"};
 if(expiry<=nowMs)return {ok:false,reason:"expired"};
 if(issued>nowMs+60_000)return {ok:false,reason:"future_event"};
 if(seenEventIds.has(item.eventId as string))return {ok:false,reason:"replayed"};
 return {ok:true,value:{eventId:item.eventId as string,applicationId:item.applicationId as string,providerReference:item.providerReference as string,decision:item.decision,issuedAt:item.issuedAt,expiresAt:item.expiresAt}};
}
/** Never call this parser before signature verification, authenticated application lookup,
 * and durable replay protection in future server-only code. This parser provides none of those. */
