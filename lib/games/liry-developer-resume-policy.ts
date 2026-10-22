/** Draft-resumption policy only. No accounts, storage, documents or sessions are active. */
export const LIRY_DEVELOPER_RESUME_ENABLED=false as const;
export type DeveloperResumeSnapshot={
 applicationId:string;ownerUserId:string;revision:number;
 preparation:{commercialModel:"premium"|"freemium"|null;declarationsComplete:boolean};
 verified:{identity:boolean;rights:boolean;bank:boolean;admission:boolean};
};
export type DeveloperResumeContext={authenticatedUserId:string;sessionVerified:boolean;serverOwnershipVerified:boolean};
export function restoreDeveloperApplication(snapshot:DeveloperResumeSnapshot|null,access:DeveloperResumeContext):DeveloperResumeSnapshot|null{
 if(!LIRY_DEVELOPER_RESUME_ENABLED||!snapshot||!access.sessionVerified||!access.serverOwnershipVerified||
    !access.authenticatedUserId||access.authenticatedUserId!==snapshot.ownerUserId)return null;
 // Security-sensitive verification must come from authenticated server records,
 // never a local browser draft.
 return {...snapshot,verified:{identity:false,rights:false,bank:false,admission:false}};
}
export function previewResumeHint(locale:"es"|"en",hasSavedApplication:boolean):string{
 if(!hasSavedApplication)return locale==="es"?"No existe una solicitud guardada.":"No saved application is available.";
 return locale==="es"?"La recuperación de solicitudes estará disponible tras habilitar cuentas seguras.":"Application resumption will become available once secure accounts are enabled.";
}
