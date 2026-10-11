/**
 * Adaptador de lectura para el futuro Top 10.
 * Nunca inventa participantes ni consulta la base de datos.
 * La capa de servidor debe entregar únicamente datos verificados y públicos.
 */
export type PublicLiryBoostEntry={
  participantId:string;
  publicName:string;
  verifiedInvitations:number;
  publicListingConsented:boolean;
};
export type PublicLiryBoostRow=Pick<PublicLiryBoostEntry,"publicName"|"verifiedInvitations">;
export function preparePublicLiryBoostTop(
 entries:ReadonlyArray<PublicLiryBoostEntry>,
 programActive:boolean
):PublicLiryBoostRow[]{
 if(!programActive)return [];
 const bestById=new Map<string,PublicLiryBoostRow>();
 for(const entry of entries){
  const name=typeof entry.publicName==="string"?entry.publicName.trim():"";
  const id=typeof entry.participantId==="string"?entry.participantId.toLowerCase():"";
  // Solo se presenta información autorizada y previamente verificada por el servidor.
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)||entry.publicListingConsented!==true||!name||name.length>60||name.includes("@")||/[<>\r\n]/.test(name)||/https?:|www\.|\d{3}[-. ]?\d{3}[-. ]?\d{4}/i.test(name)||!Number.isSafeInteger(entry.verifiedInvitations)||entry.verifiedInvitations<=0)continue;
  const previous=bestById.get(id);
  if(!previous||entry.verifiedInvitations>previous.verifiedInvitations){
   bestById.set(id,{publicName:name,verifiedInvitations:entry.verifiedInvitations});
  }
 }
 return [...bestById.values()]
  .sort((a,b)=>b.verifiedInvitations-a.verifiedInvitations||a.publicName.localeCompare(b.publicName,"es"))
  .slice(0,10)
  .map(({publicName,verifiedInvitations})=>({publicName,verifiedInvitations}));
}
