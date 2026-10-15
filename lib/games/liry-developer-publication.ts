/** Programa de publicación independiente: nunca publica sin visto bueno.
 * Contrato preparatorio: no crea registros ni cobra.
 */
export const TOTAL_CATALOG_CAPACITY=100 as const;
export const OWN_GAME_RESERVED_SLOTS=9 as const;
export const THIRD_PARTY_CATALOG_CAPACITY=91 as const;
export type ThirdPartyGameModel="premium"|"freemium";
export type DeveloperSubmissionState="draft"|"submitted"|"admission_review"|"admitted"|"uploaded_private"|"automated_checks"|"publication_review"|"approved"|"published"|"needs_changes"|"rejected"|"suspended";
export type DeveloperSubmission={
 developerId:string;
 gameId:string;
 model:ThirdPartyGameModel;
 state:DeveloperSubmissionState;
 artifactHash:string|null;
 approvedArtifactHash:string|null;
 ownerVerified:boolean;
 commercialRightsVerified:boolean;
 humanApproved:boolean;
};
export function mayPublishDeveloperGame(s:DeveloperSubmission):boolean{
 return s.state==="approved"&&s.ownerVerified===true&&s.commercialRightsVerified===true&&s.humanApproved===true&&
 typeof s.developerId==="string"&&s.developerId.length>0&&typeof s.gameId==="string"&&s.gameId.length>0&&
 (s.model==="premium"||s.model==="freemium")&&
 typeof s.artifactHash==="string"&&/^[a-f0-9]{64}$/i.test(s.artifactHash)&&
 s.artifactHash===s.approvedArtifactHash;
}
export function publicThirdPartyCatalog<T extends {published:boolean;releaseApproved:boolean}>(items:readonly T[]):readonly T[]{
 return items.filter(item=>item.published===true&&item.releaseApproved===true).slice(0,THIRD_PARTY_CATALOG_CAPACITY);
}

/** Publicación final de terceros: el estado editorial no basta para autorizar un juego.
 * La ficha pública debe estar vinculada al videojuego y a una versión validada.
 * No consulta datos privados ni habilita ninguna operación real.
 */
export type ApprovedThirdPartyListing<T> = {
  gameId:string;
  published:boolean;
  releaseApproved:boolean;
  submission:DeveloperSubmission;
  publicCard:T;
};
export function publicApprovedThirdPartyCatalog<T>(items:readonly ApprovedThirdPartyListing<T>[]):readonly T[]{
  const seen=new Set<string>();
  const visible:T[]=[];
  for(const entry of items){
    if(visible.length>=THIRD_PARTY_CATALOG_CAPACITY)break;
    if(!entry.published||!entry.releaseApproved||
       entry.gameId!==entry.submission.gameId||
       !mayPublishDeveloperGame(entry.submission)||
       seen.has(entry.gameId))continue;
    seen.add(entry.gameId);
    visible.push(entry.publicCard);
  }
  return visible;
}
