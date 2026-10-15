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

/** Projection explicitly whitelists public metadata. Internal developer IDs,
 * verification flags, build hashes and commercial records never cross this boundary.
 */
export type PublicThirdPartyCard={
  slug:string;
  title:string;
  description:string;
  model:ThirdPartyGameModel;
  coverUrl:string|null;
};
export type ApprovedThirdPartyPublicRecord=Omit<ApprovedThirdPartyListing<PublicThirdPartyCard>,"publicCard">&{
  publicCard:PublicThirdPartyCard;
};
/** Only absolute, credential-free HTTPS addresses may enter public cards. */
export function safeThirdPartyCoverUrl(value:unknown):string|null{
  if(typeof value!=="string"||value.length>2048||value!==value.trim())return null;
  try{
    const url=new URL(value);
    if(url.protocol!=="https:"||!url.hostname||url.username||url.password||url.hash)return null;
    if(url.hostname==="localhost"||url.hostname.endsWith(".localhost")||
       /^(?:127|10|192\.168)\./.test(url.hostname)||
       /^172\.(?:1[6-9]|2\d|3[01])\./.test(url.hostname)||
       url.hostname==="0.0.0.0"||url.hostname==="[::1]")return null;
    return url.href;
  }catch{return null;}
}

export function safePublicThirdPartyCards(records:readonly ApprovedThirdPartyPublicRecord[]):readonly PublicThirdPartyCard[]{
  const visible:PublicThirdPartyCard[]=[];
  const seenGames=new Set<string>();
  const seenSlugs=new Set<string>();
  for(const record of records){
    if(visible.length>=THIRD_PARTY_CATALOG_CAPACITY)break;
    const card=record.publicCard;
    if(!record.published||!record.releaseApproved||
       record.gameId!==record.submission.gameId||
       !mayPublishDeveloperGame(record.submission)||
       !card||card.model!==record.submission.model||
       seenGames.has(record.gameId))continue;
    const slug=typeof card.slug==="string"?card.slug.trim():"";
    const title=typeof card.title==="string"?card.title.trim():"";
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||seenSlugs.has(slug)||
       !title||title.length>120||
       (card.model!=="premium"&&card.model!=="freemium"))continue;
    const description=typeof card.description==="string"?card.description.trim().slice(0,300):"";
    const coverUrl=safeThirdPartyCoverUrl(card.coverUrl);
    seenGames.add(record.gameId);
    seenSlugs.add(slug);
    visible.push({slug,title,description,model:card.model,coverUrl});
  }
  return visible;
}

/** Estado comercial distinto del proceso de aprobación editorial.
 * Una ficha visible no implica checkout ni acceso al ejecutable.
 */
export type ThirdPartyCommercialState="preparing"|"approved_not_released"|"published_information_only"|"on_sale";
export type CommercialReadiness={
 publicationApproved:boolean;
 published:boolean;
 commerceEnabled:boolean;
 paymentProviderReady:boolean;
 contractApproved:boolean;
 priceVerified:boolean;
};
export function thirdPartyCommercialState(readiness:CommercialReadiness):ThirdPartyCommercialState{
 if(!readiness.publicationApproved)return "preparing";
 if(!readiness.published)return "approved_not_released";
 if(!readiness.commerceEnabled||!readiness.paymentProviderReady||!readiness.contractApproved||!readiness.priceVerified)
  return "published_information_only";
 return "on_sale";
}
export function mayEnableThirdPartyCheckout(readiness:CommercialReadiness):boolean{
 return thirdPartyCommercialState(readiness)==="on_sale";
}
