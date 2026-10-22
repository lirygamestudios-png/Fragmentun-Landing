import {biometricProviderStatus} from "./liry-biometric-readiness";
import type {ProviderEventEnvelope} from "./liry-biometric-provider-envelope";
/** Offline blueprint: caller-provided snapshots are NOT durable replay protection. */
export type IdentityCaseSnapshot=Readonly<{applicationId:string;status:"pending"|"cancelled"|"superseded"|"closed";providerReference:string;expiresAt:string;supersededBy:string|null}>;
export type EventReplaySnapshot=Readonly<{seenEventIds:ReadonlySet<string>;seenProviderReferences:ReadonlySet<string>}>;
export type EventReplayAssessment=Readonly<{accepted:false;reason:"integration_disabled"|"cancelled_or_superseded"|"expired_case"|"wrong_application"|"duplicate_event"|"invalid_event"|"requires_durable_atomic_check"}>;
export function assessProviderReplay(event:ProviderEventEnvelope,record:IdentityCaseSnapshot,history:EventReplaySnapshot,nowMs:number):EventReplayAssessment{
 if(biometricProviderStatus==="disabled")return {accepted:false,reason:"integration_disabled"};
 if(record.status!=="pending"||record.supersededBy!==null)return {accepted:false,reason:"cancelled_or_superseded"};
 if(record.applicationId!==event.applicationId||record.providerReference!==event.providerReference)return {accepted:false,reason:"wrong_application"};
 const expiry=Date.parse(record.expiresAt),issued=Date.parse(event.issuedAt),eventExpiry=Date.parse(event.expiresAt);
 if(!Number.isFinite(nowMs)||!Number.isFinite(expiry)||!Number.isFinite(issued)||!Number.isFinite(eventExpiry)||issued>nowMs+60_000||expiry<=nowMs||eventExpiry<=nowMs)return {accepted:false,reason:"expired_case"};
 if(history.seenEventIds.has(event.eventId)||history.seenProviderReferences.has(event.providerReference))return {accepted:false,reason:"duplicate_event"};
 return {accepted:false,reason:"requires_durable_atomic_check"};
}
/** Future production requires signed webhooks and atomic UNIQUE(eventId), application-bound transactions. */
