/** Planned developer dossier handling, documented as policy only.
 * No uploads, storage buckets, database reads or biometric capture are active.
 */
export type DeveloperDossierKind="identity_provider_result"|"bank_statement"|"ip_rights_evidence"|"admission_decision";
export type DossierRole="applicant"|"identity_provider"|"payout_reviewer"|"rights_reviewer"|"admission_officer";
export type DossierAction="view_status"|"upload"|"read_sensitive"|"approve";
export const DEVELOPER_DOSSIER_UPLOADS_ENABLED=false as const;

const permissions:Readonly<Record<DeveloperDossierKind,Readonly<Partial<Record<DossierAction,readonly DossierRole[]>>>>>={
 identity_provider_result:{view_status:["applicant","admission_officer"],read_sensitive:["admission_officer"],approve:["identity_provider"]},
 bank_statement:{view_status:["applicant","payout_reviewer","admission_officer"],upload:["applicant"],read_sensitive:["payout_reviewer"],approve:["payout_reviewer"]},
 ip_rights_evidence:{view_status:["applicant","rights_reviewer","admission_officer"],upload:["applicant"],read_sensitive:["rights_reviewer"],approve:["rights_reviewer"]},
 admission_decision:{view_status:["applicant","admission_officer"],approve:["admission_officer"]}
};
export function canAccessDeveloperDossier(args:{
 kind:DeveloperDossierKind;role:DossierRole;action:DossierAction;
 authenticated:boolean;applicationBound:boolean;staffGrantVerified:boolean;
}):boolean{
 if(!args.authenticated||!args.applicationBound)return false;
 if(args.action==="upload"&&!DEVELOPER_DOSSIER_UPLOADS_ENABLED)return false;
 if(args.action==="read_sensitive"&&!args.staffGrantVerified)return false;
 if(args.action==="approve"&&!args.staffGrantVerified)return false;
 return permissions[args.kind][args.action]?.includes(args.role)===true;
}
export const DEVELOPER_DOSSIER_SECURITY_REQUIREMENTS=Object.freeze([
 "Separate encrypted storage with private-by-default access",
 "Per-applicant authorization, no client-supplied trusted user IDs",
 "Provider-verified identity result only; no raw facial biometrics in LIRYGAMES",
 "Bank statements accessible only to payout review roles",
 "Private rights-evidence review independent of identity",
 "Minimal audit records without bank document contents",
 "Defined retention, expiry, deletion, breach response and human appeals",
 "No document ingestion until a vetted secure storage and review workflow is enabled"
] as const);
