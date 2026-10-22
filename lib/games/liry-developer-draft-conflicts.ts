/** Liry Developers: explanatory conflict handling only. No draft storage or real recovery. */
export type DeveloperDraftConflictResolution="refresh_required"|"review_local_changes"|"no_conflict";
export type DeveloperDraftConflictView={status:DeveloperDraftConflictResolution;canOverwrite:false;canAutoMerge:false;message:string};
export function explainDeveloperDraftConflict(expectedRevision:number,currentRevision:number,locale:"es"|"en"):DeveloperDraftConflictView{
 const conflict=!Number.isSafeInteger(expectedRevision)||!Number.isSafeInteger(currentRevision)||expectedRevision<0||currentRevision<0||expectedRevision!==currentRevision;
 if(!conflict)return{status:"no_conflict",canOverwrite:false,canAutoMerge:false,message:locale==="es"?"La versión coincide; el guardado real sigue desactivado.":"The revision matches; live saving remains disabled."};
 if(expectedRevision>currentRevision||expectedRevision<0||currentRevision<0)return{status:"refresh_required",canOverwrite:false,canAutoMerge:false,message:locale==="es"?"No se pudo verificar la versión. Actualiza el estado del expediente antes de continuar.":"The revision could not be verified. Refresh the application status before continuing."};
 return{status:"review_local_changes",canOverwrite:false,canAutoMerge:false,message:locale==="es"?"Existe una versión más reciente de esta solicitud. Conserva tus cambios locales y compáralos antes de continuar; no se sobrescribirá automáticamente.":"A newer version of this application exists. Keep and review your local changes before continuing; nothing will be overwritten automatically."};
}
