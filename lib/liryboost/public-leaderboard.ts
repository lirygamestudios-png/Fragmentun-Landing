/**
 * Adaptador de lectura para el futuro Top 10.
 * Nunca inventa participantes ni consulta la base de datos.
 * La capa de servidor debe entregar únicamente datos verificados y públicos.
 */
export type PublicLiryBoostEntry={
  publicName:string;
  verifiedInvitations:number;
};
export function preparePublicLiryBoostTop(
 entries:ReadonlyArray<PublicLiryBoostEntry>,
 programActive:boolean
):PublicLiryBoostEntry[]{
 if(!programActive)return [];
 const bestByName=new Map<string,PublicLiryBoostEntry>();
 for(const entry of entries){
  const name=entry.publicName.trim();
  if(!name||name.length>60||!Number.isSafeInteger(entry.verifiedInvitations)||entry.verifiedInvitations<=0)continue;
  const key=name.toLocaleLowerCase("es");
  const previous=bestByName.get(key);
  if(!previous||entry.verifiedInvitations>previous.verifiedInvitations){
   bestByName.set(key,{publicName:name,verifiedInvitations:entry.verifiedInvitations});
  }
 }
 return [...bestByName.values()]
  .sort((a,b)=>b.verifiedInvitations-a.verifiedInvitations||a.publicName.localeCompare(b.publicName,"es"))
  .slice(0,10);
}
