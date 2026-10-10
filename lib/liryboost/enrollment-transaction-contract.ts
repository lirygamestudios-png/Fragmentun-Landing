/**
 * Contrato puro para interpretar resultado de inscripción transaccional futura.
 * La unicidad debe imponerla PostgreSQL; esto no escribe ni consulta Supabase.
 */
export type EnrollmentInsertResult =
 | {kind:"created"; registrationId:string}
 | {kind:"duplicate"; existingOwnerId:string|null}
 | {kind:"blocked"}
 | {kind:"failure"};
export type EnrollmentDecision="registered"|"already_registered"|"conflict"|"denied";
export function interpretEnrollmentInsert(result:EnrollmentInsertResult,currentUserId:string):EnrollmentDecision{
 if(!currentUserId.trim())return "denied";
 if(result.kind==="created")return result.registrationId.trim()?"registered":"denied";
 if(result.kind==="duplicate")return result.existingOwnerId===currentUserId?"already_registered":"conflict";
 return "denied";
}
