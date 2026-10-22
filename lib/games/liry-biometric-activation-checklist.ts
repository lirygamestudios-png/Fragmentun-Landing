import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Readiness report only; never enables biometric operations. */
export type ActivationRequirement="provider_contract"|"legal_privacy"|"explicit_consent"|"applicant_auth"|"provider_signature"|"application_binding"|"nonce_replay"|"retention_deletion"|"human_review"|"non_biometric_alternative";
export const biometricActivationRequirements:ReadonlyArray<ActivationRequirement>=["provider_contract","legal_privacy","explicit_consent","applicant_auth","provider_signature","application_binding","nonce_replay","retention_deletion","human_review","non_biometric_alternative"];
export type ActivationChecklist=Readonly<Partial<Record<ActivationRequirement,boolean>>>;
export type ActivationReadiness=Readonly<{enabled:false;missing:ReadonlyArray<ActivationRequirement>;completed:number;total:number}>;
export function assessBiometricReadiness(checklist:ActivationChecklist):ActivationReadiness{
 const missing=biometricActivationRequirements.filter(key=>checklist[key]!==true);
 // Policy is deliberately fail-closed even when all requirements are marked true:
 // enabling a paid provider requires separate authorization and implementation.
 void biometricProviderStatus;
 return {enabled:false,missing,completed:biometricActivationRequirements.length-missing.length,total:biometricActivationRequirements.length};
}
